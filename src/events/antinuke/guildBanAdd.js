const { AuditLogEvent } = require('discord.js');
const antiNukeTracker = require('../../utils/antiNukeTracker');
const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'guildBanAdd',
  async execute(ban) {
    if (!ban.guild) return;

    await antiNukeTracker.handleAction(
      ban.guild,
      AuditLogEvent.MemberBanAdd,
      'memberBan',
      `${ban.user.tag} (${ban.user.id})`
    );

    await logger.sendLog(ban.guild, 'members', {
      title: '🔨 Member Banned',
      color: COLORS.ERROR,
      fields: [
        { name: 'User', value: `<@${ban.user.id}> (${ban.user.tag})`, inline: true },
        { name: 'User ID', value: ban.user.id, inline: true }
      ]
    });
  }
};
