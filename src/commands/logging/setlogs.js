const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../utils/database');
const { createEmbed, COLORS } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setDescription('Configure server audit and security logging')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('channel')
        .setDescription('Set the primary log channel')
        .addChannelOption(opt =>
          opt.setName('target')
            .setDescription('Channel where server audit logs will be sent')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('toggle')
        .setDescription('Toggle specific log event categories')
        .addStringOption(opt =>
          opt.setName('category')
            .setDescription('Category to toggle')
            .setRequired(true)
            .addChoices(
              { name: 'Anti-Nuke Alerts', value: 'antinuke' },
              { name: 'Message Deletions / Edits', value: 'messages' },
              { name: 'Member Join / Leave / Updates', value: 'members' },
              { name: 'Channel Changes', value: 'channels' },
              { name: 'Role Changes', value: 'roles' },
              { name: 'Voice State', value: 'voice' }
            )
        )
        .addBooleanOption(opt =>
          opt.setName('enabled')
            .setDescription('Enable or disable this category')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('View current logging configuration')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const guildData = db.getGuild(guildId);

    if (subcommand === 'channel') {
      const targetChannel = interaction.options.getChannel('target');
      db.updateGuild(guildId, g => {
        g.logging.channelId = targetChannel.id;
      });

      const embed = createEmbed({
        title: '📜 Log Channel Set',
        color: COLORS.SUCCESS,
        description: `Server audit and security logs will now be sent to <#${targetChannel.id}>.`
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'toggle') {
      const category = interaction.options.getString('category');
      const enabled = interaction.options.getBoolean('enabled');

      db.updateGuild(guildId, g => {
        g.logging.events[category] = enabled;
      });

      return interaction.reply({
        content: `✅ Logging for **${category}** set to: **${enabled ? 'ENABLED' : 'DISABLED'}**.`,
        ephemeral: true
      });
    }

    if (subcommand === 'status') {
      const { channelId, events } = guildData.logging;

      const embed = createEmbed({
        title: '📜 Server Logging Status',
        color: COLORS.DEFAULT,
        fields: [
          { name: 'Log Channel', value: channelId ? `<#${channelId}>` : '❌ Not configured', inline: false },
          { 
            name: 'Active Modules', 
            value: Object.entries(events).map(([cat, on]) => `${on ? '🟢' : '🔴'} **${cat}**`).join('\n'), 
            inline: false 
          }
        ]
      });

      return interaction.reply({ embeds: [embed] });
    }
  }
};
