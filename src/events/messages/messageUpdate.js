const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (!oldMessage.guild || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // Ignore embed updates/pins

    const oldContent = oldMessage.content ? (oldMessage.content.length > 1024 ? oldMessage.content.substring(0, 1020) + '...' : oldMessage.content) : '*Empty*';
    const newContent = newMessage.content ? (newMessage.content.length > 1024 ? newMessage.content.substring(0, 1020) + '...' : newMessage.content) : '*Empty*';

    await logger.sendLog(oldMessage.guild, 'messages', {
      title: '✏️ Message Edited',
      color: COLORS.WARNING,
      fields: [
        { name: 'Author', value: `<@${oldMessage.author.id}> (${oldMessage.author.tag})`, inline: true },
        { name: 'Channel', value: `<#${oldMessage.channel.id}>`, inline: true },
        { name: 'Jump to Message', value: `[Click Here](${newMessage.url})`, inline: true },
        { name: 'Before', value: oldContent, inline: false },
        { name: 'After', value: newContent, inline: false }
      ]
    });
  }
};
