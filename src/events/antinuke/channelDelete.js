const { AuditLogEvent } = require('discord.js');
const antiNukeTracker = require('../../utils/antiNukeTracker');
const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'channelDelete',
  async execute(channel) {
    if (!channel.guild) return;

    // 1. Anti-nuke check
    await antiNukeTracker.handleAction(
      channel.guild,
      AuditLogEvent.ChannelDelete,
      'channelDelete',
      `#${channel.name}`
    );

    // 2. Audit log
    await logger.sendLog(channel.guild, 'channels', {
      title: '🗑️ Channel Deleted',
      color: COLORS.ERROR,
      fields: [
        { name: 'Channel Name', value: `#${channel.name}`, inline: true },
        { name: 'Channel Type', value: `${channel.type}`, inline: true },
        { name: 'Channel ID', value: channel.id, inline: true }
      ]
    });
  }
};
