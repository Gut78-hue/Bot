const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    const content = message.content ? (message.content.length > 1024 ? message.content.substring(0, 1020) + '...' : message.content) : '*No text content (embed or attachment)*';

    await logger.sendLog(message.guild, 'messages', {
      title: '🗑️ Message Deleted',
      color: COLORS.ERROR,
      fields: [
        { name: 'Author', value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Deleted Content', value: content, inline: false }
      ]
    });
  }
};
