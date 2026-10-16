const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display available commands and bot features'),

  async execute(interaction) {
    const embed = createEmbed({
      title: '🛡️ Security, Ticket & Logging Bot - Commands',
      color: COLORS.DEFAULT,
      description: 'Here are all the available slash commands to protect and manage your server.',
      fields: [
        {
          name: '🛡️ Anti-Nuke Protection',
          value: [
            '`/antinuke status` - Check active limits, status & whitelist',
            '`/antinuke toggle <enabled>` - Turn anti-nuke on/off',
            '`/antinuke punishment <ban|kick|strip_roles>` - Set punishment',
            '`/antinuke whitelist-add <user>` - Whitelist a trusted admin',
            '`/antinuke whitelist-remove <user>` - Remove user from whitelist'
          ].join('\n')
        },
        {
          name: '🎫 Ticket System',
          value: [
            '`/ticket-setup <category> <support-role> [transcripts]` - Setup tickets',
            '`/ticket-panel [title] [description]` - Deploy button panel in channel'
          ].join('\n')
        },
        {
          name: '📜 Logging System',
          value: [
            '`/setlogs channel <channel>` - Set primary audit log channel',
            '`/setlogs toggle <category> <enabled>` - Toggle specific event logs',
            '`/setlogs status` - View active logging configurations'
          ].join('\n')
        },
        {
          name: '⚙️ Utilities',
          value: [
            '`/ping` - Check bot response latency & uptime',
            '`/help` - Show this guide'
          ].join('\n')
        }
      ],
      footer: { text: 'Hosted 24/7 on Render' }
    });

    await interaction.reply({ embeds: [embed] });
  }
};
