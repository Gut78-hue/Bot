const { AuditLogEvent } = require('discord.js');
const antiNukeTracker = require('../../utils/antiNukeTracker');
const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'channelCreate',
  async execute(channel) {
    if (!channel.guild) return;

    // Ignore ticket channels created by the bot
    if (channel.name.startsWith('ticket-')) return;

    // 1. Anti-nuke check
    await antiNukeTracker.handleAction(
      channel.guild,
      AuditLogEvent.ChannelCreate,
      'channelCreate',
      `#${channel.name}`
    );

    // 2. Audit log
    await logger.sendLog(channel.guild, 'channels', {
      title: '📁 Channel Created',
      color: COLORS.SUCCESS,
      fields: [
        { name: 'Channel', value: `<#${channel.id}> (\`${channel.name}\`)`, inline: true },
        { name: 'Type', value: `${channel.type}`, inline: true },
        { name: 'ID', value: channel.id, inline: true }
      ]
    });
  }
};
