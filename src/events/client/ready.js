const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[Client] Logged in as ${client.user.tag} (${client.user.id})`);

    client.user.setPresence({
      activities: [{ name: '🛡️ Server Security | /help', type: ActivityType.Custom }],
      status: 'online'
    });
  }
};
