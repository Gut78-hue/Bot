const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Deploy a ticket creation panel into this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Custom title for the ticket panel')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Custom description explaining what this ticket panel is for')
        .setRequired(false)
    ),

  async execute(interaction) {
    const title = interaction.options.getString('title') || '📩 Support & Help Desk';
    const description = interaction.options.getString('description') || 
      'Need assistance, want to report an issue, or have a question?\nClick the button below to open a private ticket with our staff team!';

    const embed = createEmbed({
      title,
      description,
      color: COLORS.DEFAULT,
      footer: { text: 'Tickets are handled privately with authorized staff.' }
    });

    const button = new ButtonBuilder()
      .setCustomId('btn_create_ticket')
      .setLabel('Create Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Ticket panel successfully deployed!', ephemeral: true });
  }
};
