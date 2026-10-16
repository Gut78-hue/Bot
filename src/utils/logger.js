const db = require('./database');
const { createEmbed, COLORS } = require('./embedBuilder');

class Logger {
  async sendLog(guild, eventType, embedOptions) {
    try {
      const guildData = db.getGuild(guild.id);
      if (!guildData.logging.channelId) return;
      if (guildData.logging.events[eventType] === false) return;

      const channel = await guild.channels.fetch(guildData.logging.channelId).catch(() => null);
      if (!channel || !channel.isTextBased()) return;

      const embed = createEmbed(embedOptions);
      await channel.send({ embeds: [embed] }).catch(() => null);
    } catch (err) {
      console.error(`[Logger] Failed to dispatch log (${eventType}):`, err);
    }
  }

  async sendAntiNukeLog(guild, { action, executor, target, reason, punished }) {
    return this.sendLog(guild, 'antinuke', {
      title: '🚨 Anti-Nuke Triggered!',
      color: COLORS.ERROR,
      description: `An unauthorized or suspicious action exceeded the security limit.`,
      fields: [
        { name: 'Action', value: `\`${action}\``, inline: true },
        { name: 'Offender', value: executor ? `<@${executor.id}> (${executor.tag || executor.id})` : 'Unknown', inline: true },
        { name: 'Target', value: target || 'N/A', inline: true },
        { name: 'Punishment Applied', value: punished ? `✅ ${punished.toUpperCase()}` : '⚠️ Failed / Insufficient Permissions', inline: true },
        { name: 'Reason', value: reason || 'Rate limit exceeded', inline: false }
      ],
      footer: { text: `Guild ID: ${guild.id} • Security Alert` }
    });
  }
}

module.exports = new Logger();
