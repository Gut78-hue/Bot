const { AuditLogEvent } = require('discord.js');
const antiNukeTracker = require('../../utils/antiNukeTracker');
const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const { guild, user } = member;

    // Check if the member left or was kicked
    setTimeout(async () => {
      try {
        const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick }).catch(() => null);
        const entry = auditLogs?.entries.first();

        const wasKicked = entry && entry.target?.id === user.id && (Date.now() - entry.createdTimestamp < 5000);

        if (wasKicked) {
          // Anti-nuke mass kick detection
          await antiNukeTracker.handleAction(
            guild,
            AuditLogEvent.MemberKick,
            'memberKick',
            `${user.tag} (${user.id})`
          );

          await logger.sendLog(guild, 'members', {
            title: '👢 Member Kicked',
            color: COLORS.WARNING,
            fields: [
              { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
              { name: 'Kicked By', value: `<@${entry.executor.id}>`, inline: true },
              { name: 'Reason', value: entry.reason || 'No reason provided', inline: false }
            ]
          });
        } else {
          // Normal member leave
          await logger.sendLog(guild, 'members', {
            title: '📤 Member Left',
            color: COLORS.DARK,
            fields: [
              { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
              { name: 'User ID', value: user.id, inline: true },
              { name: 'Total Members', value: `${guild.memberCount}`, inline: true }
            ]
          });
        }
      } catch (err) {
        console.error('[guildMemberRemove] Error:', err);
      }
    }, 1000);
  }
};
