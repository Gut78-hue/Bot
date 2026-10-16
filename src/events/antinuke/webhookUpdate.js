const { AuditLogEvent } = require('discord.js');
const antiNukeTracker = require('../../utils/antiNukeTracker');

module.exports = {
  name: 'webhookUpdate',
  async execute(channel) {
    if (!channel.guild) return;

    await antiNukeTracker.handleAction(
      channel.guild,
      AuditLogEvent.WebhookCreate,
      'webhookCreate',
      `#${channel.name}`
    );
  }
};
