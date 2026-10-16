const logger = require('../../utils/logger');
const { COLORS } = require('../../utils/embedBuilder');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const member = newState.member || oldState.member;
    const guild = newState.guild || oldState.guild;
    if (!guild || !member || member.user.bot) return;

    // Joined voice
    if (!oldState.channelId && newState.channelId) {
      await logger.sendLog(guild, 'voice', {
        title: '🔊 Voice Channel Joined',
        color: COLORS.SUCCESS,
        fields: [
          { name: 'Member', value: `<@${member.id}> (${member.user.tag})`, inline: true },
          { name: 'Channel', value: `<#${newState.channelId}>`, inline: true }
        ]
      });
      return;
    }

    // Left voice
    if (oldState.channelId && !newState.channelId) {
      await logger.sendLog(guild, 'voice', {
        title: '🔇 Voice Channel Left',
        color: COLORS.DARK,
        fields: [
          { name: 'Member', value: `<@${member.id}> (${member.user.tag})`, inline: true },
          { name: 'Channel', value: `<#${oldState.channelId}>`, inline: true }
        ]
      });
      return;
    }

    // Switched channels
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      await logger.sendLog(guild, 'voice', {
        title: '🔀 Switched Voice Channel',
        color: COLORS.WARNING,
        fields: [
          { name: 'Member', value: `<@${member.id}> (${member.user.tag})`, inline: true },
          { name: 'From', value: `<#${oldState.channelId}>`, inline: true },
          { name: 'To', value: `<#${newState.channelId}>`, inline: true }
        ]
      });
      return;
    }
  }
};
