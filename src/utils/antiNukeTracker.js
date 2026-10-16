const { AuditLogEvent, PermissionsBitField } = require('discord.js');
const db = require('./database');
const logger = require('./logger');

class AntiNukeTracker {
  constructor() {
    // Map of guildId -> Map of userId -> Map of actionType -> Array of timestamps
    this.actionHistory = new Map();
  }

  isWhitelisted(guild, userId) {
    if (userId === guild.ownerId) return true;
    if (userId === guild.client.user.id) return true;
    if (process.env.OWNER_ID && userId === process.env.OWNER_ID) return true;

    const guildData = db.getGuild(guild.id);
    return guildData.antinuke.whitelistedUsers.includes(userId);
  }

  async checkRateLimit(guild, executorId, actionType) {
    const guildData = db.getGuild(guild.id);
    if (!guildData.antinuke.enabled) return false;

    const limits = guildData.antinuke.limits[actionType];
    if (!limits) return false;

    const now = Date.now();
    const windowMs = limits.window * 1000;

    if (!this.actionHistory.has(guild.id)) {
      this.actionHistory.set(guild.id, new Map());
    }
    const guildMap = this.actionHistory.get(guild.id);

    if (!guildMap.has(executorId)) {
      guildMap.set(executorId, new Map());
    }
    const userMap = guildMap.get(executorId);

    if (!userMap.has(actionType)) {
      userMap.set(actionType, []);
    }
    let timestamps = userMap.get(actionType);

    // Filter out timestamps outside the sliding window
    timestamps = timestamps.filter(ts => now - ts < windowMs);
    timestamps.push(now);
    userMap.set(actionType, timestamps);

    return timestamps.length > limits.max;
  }

  async punishExecutor(guild, executor, reason) {
    const guildData = db.getGuild(guild.id);
    const punishment = guildData.antinuke.punishment || 'ban';

    try {
      const member = await guild.members.fetch(executor.id).catch(() => null);
      if (!member) {
        // Fallback: ban by user ID if member already left
        if (punishment === 'ban') {
          await guild.bans.create(executor.id, { reason }).catch(() => null);
          return 'ban';
        }
        return null;
      }

      // Check hierarchy: cannot punish guild owner or member higher than bot
      if (member.id === guild.ownerId) return null;
      if (!member.bannable && punishment === 'ban') {
        console.warn(`[AntiNuke] Cannot ban ${member.user.tag} (Role hierarchy or permissions).`);
      }

      if (punishment === 'ban') {
        await member.ban({ reason }).catch(console.error);
        return 'ban';
      } else if (punishment === 'kick') {
        await member.kick(reason).catch(console.error);
        return 'kick';
      } else if (punishment === 'strip_roles') {
        const dangerousPerms = [
          PermissionsBitField.Flags.Administrator,
          PermissionsBitField.Flags.ManageGuild,
          PermissionsBitField.Flags.ManageRoles,
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.BanMembers,
          PermissionsBitField.Flags.KickMembers
        ];

        const rolesToRemove = member.roles.cache.filter(role => 
          role.id !== guild.id && dangerousPerms.some(perm => role.permissions.has(perm))
        );

        if (rolesToRemove.size > 0) {
          await member.roles.remove(rolesToRemove, reason).catch(console.error);
          return 'strip_roles';
        }
      }
    } catch (err) {
      console.error(`[AntiNuke] Failed to punish ${executor.id}:`, err);
      return null;
    }
  }

  async handleAction(guild, auditLogType, actionName, targetInfo = '') {
    try {
      const guildData = db.getGuild(guild.id);
      if (!guildData.antinuke.enabled) return;

      // Small delay to ensure audit log entry is written by Discord
      await new Promise(r => setTimeout(r, 800));

      const logs = await guild.fetchAuditLogs({ limit: 1, type: auditLogType }).catch(() => null);
      if (!logs || logs.entries.size === 0) return;

      const entry = logs.entries.first();
      if (!entry) return;

      // Check entry freshness (within last 7 seconds)
      if (Date.now() - entry.createdTimestamp > 7000) return;

      const executor = entry.executor;
      if (!executor) return;

      if (this.isWhitelisted(guild, executor.id)) return;

      const triggered = await this.checkRateLimit(guild, executor.id, actionName);
      if (!triggered) return;

      const punishmentResult = await this.punishExecutor(
        guild,
        executor,
        `Anti-Nuke Triggered: Mass ${actionName}`
      );

      await logger.sendAntiNukeLog(guild, {
        action: actionName,
        executor,
        target: targetInfo || entry.target?.name || entry.target?.id || 'Unknown',
        reason: `Exceeded action limit for ${actionName}`,
        punished: punishmentResult
      });
    } catch (err) {
      console.error(`[AntiNuke] Error in handleAction (${actionName}):`, err);
    }
  }
}

module.exports = new AntiNukeTracker();
