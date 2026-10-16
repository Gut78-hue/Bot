const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../utils/database');
const { createEmbed, COLORS } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('Configure the server ticket system')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('category')
        .setDescription('Category where new ticket channels will be created')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('support-role')
        .setDescription('Staff role that can view and answer tickets')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('transcripts')
        .setDescription('Channel where ticket transcripts are saved')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction) {
    const category = interaction.options.getChannel('category');
    const supportRole = interaction.options.getRole('support-role');
    const transcripts = interaction.options.getChannel('transcripts');

    db.updateGuild(interaction.guildId, guild => {
      guild.tickets.categoryId = category.id;
      guild.tickets.supportRoleId = supportRole.id;
      if (transcripts) {
        guild.tickets.logChannelId = transcripts.id;
      }
    });

    const embed = createEmbed({
      title: '🎫 Ticket System Configured',
      color: COLORS.SUCCESS,
      description: 'Your ticket settings have been updated successfully!',
      fields: [
        { name: 'Category', value: `<#${category.id}>`, inline: true },
        { name: 'Support Role', value: `<@&${supportRole.id}>`, inline: true },
        { name: 'Transcripts Channel', value: transcripts ? `<#${transcripts.id}>` : 'Not set', inline: true }
      ],
      footer: { text: 'Use /ticket-panel to deploy the ticket creation embed' }
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
