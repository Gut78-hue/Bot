const { AuditLogEvent } = require('discord.js');
const antiNukeTracker = require('../../utils/antiNukeTracker');
const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'roleCreate',
  async execute(role) {
    if (!role.guild) return;

    await antiNukeTracker.handleAction(
      role.guild,
      AuditLogEvent.RoleCreate,
      'roleCreate',
      `@${role.name}`
    );

    await logger.sendLog(role.guild, 'roles', {
      title: '✨ Role Created',
      color: COLORS.SUCCESS,
      fields: [
        { name: 'Role', value: `<@&${role.id}> (\`${role.name}\`)`, inline: true },
        { name: 'Role ID', value: role.id, inline: true }
      ]
    });
  }
};
