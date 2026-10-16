const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'roleUpdate',
  async execute(oldRole, newRole) {
    if (!oldRole.guild) return;

    const changes = [];
    if (oldRole.name !== newRole.name) {
      changes.push(`Name changed: \`${oldRole.name}\` ➔ \`${newRole.name}\``);
    }
    if (oldRole.color !== newRole.color) {
      changes.push(`Color changed: \`${oldRole.hexColor}\` ➔ \`${newRole.hexColor}\``);
    }
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      changes.push(`Permissions modified`);
    }

    if (changes.length === 0) return;

    await logger.sendLog(newRole.guild, 'roles', {
      title: '🛠️ Role Updated',
      color: COLORS.WARNING,
      fields: [
        { name: 'Role', value: `<@&${newRole.id}> (\`${newRole.name}\`)`, inline: true },
        { name: 'Changes', value: changes.join('\n'), inline: false }
      ]
    });
  }
};
