const { AuditLogEvent } = require('discord.js');
const db = require('../../utils/database');
const antiNukeTracker = require('../../utils/antiNukeTracker');
const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const { guild, user } = member;

    // 1. Anti-Nuke: Unauthorized Bot Addition Protection
    if (user.bot) {
      const guildData = db.getGuild(guild.id);
      if (guildData.antinuke.enabled && guildData.antinuke.limits.botAdd.blockUnauthorized) {
        await new Promise(r => setTimeout(r, 1000));
        const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd }).catch(() => null);
        const entry = auditLogs?.entries.first();

        if (entry && entry.target?.id === user.id) {
          const inviter = entry.executor;
          if (inviter && !antiNukeTracker.isWhitelisted(guild, inviter.id)) {
            // Kick/ban the unauthorized bot immediately
            await member.ban({ reason: 'Anti-Nuke: Unauthorized bot addition' }).catch(() => null);

            // Punish the inviter
            const punished = await antiNukeTracker.punishExecutor(
              guild,
              inviter,
              `Anti-Nuke: Added unauthorized bot (${user.tag})`
            );

            await logger.sendAntiNukeLog(guild, {
              action: 'Unauthorized Bot Add',
              executor: inviter,
              target: `${user.tag} (${user.id})`,
              reason: 'Unauthorized bot invited to server',
              punished
            });
            return;
          }
        }
      }
    }

    // 2. Member Join Audit Log
    const accountAge = Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24));
    await logger.sendLog(guild, 'members', {
      title: '📥 Member Joined',
      color: COLORS.SUCCESS,
      thumbnail: user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Account Age', value: `${accountAge} days ago (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`, inline: false },
        { name: 'Total Members', value: `${guild.memberCount}`, inline: true }
      ]
    });
  }
};
