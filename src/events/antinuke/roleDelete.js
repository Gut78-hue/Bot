const { AuditLogEvent } = require('discord.js');
const antiNukeTracker = require('../../utils/antiNukeTracker');
const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'roleDelete',
  async execute(role) {
    if (!role.guild) return;

    await antiNukeTracker.handleAction(
      role.guild,
      AuditLogEvent.RoleDelete,
      'roleDelete',
      `@${role.name}`
    );

    await logger.sendLog(role.guild, 'roles', {
      title: '🗑️ Role Deleted',
      color: COLORS.ERROR,
      fields: [
        { name: 'Role Name', value: `@${role.name}`, inline: true },
        { name: 'Role ID', value: role.id, inline: true }
      ]
    });
  }
};
