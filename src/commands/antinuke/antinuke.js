const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const { createEmbed, COLORS } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Configure and monitor Anti-Nuke security protections')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('View current Anti-Nuke configuration and protection status')
    )
    .addSubcommand(sub =>
      sub.setName('toggle')
        .setDescription('Enable or disable Anti-Nuke protections')
        .addBooleanOption(opt =>
          opt.setName('enabled')
            .setDescription('Set enabled or disabled')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('punishment')
        .setDescription('Choose punishment for unauthorized raid/nuke actions')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('Punishment type')
            .setRequired(true)
            .addChoices(
              { name: 'Ban Member', value: 'ban' },
              { name: 'Kick Member', value: 'kick' },
              { name: 'Strip Dangerous Roles', value: 'strip_roles' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('whitelist-add')
        .setDescription('Whitelist a trusted administrator or bot from anti-nuke triggers')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to whitelist')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('whitelist-remove')
        .setDescription('Remove a user from the anti-nuke whitelist')
        .addUserOption(opt =>
          opt.setName('user')
            .setDescription('User to remove')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const guildData = db.getGuild(guildId);

    if (subcommand === 'status') {
      const { enabled, punishment, whitelistedUsers, limits } = guildData.antinuke;
      const whitelistText = whitelistedUsers.length > 0 
        ? whitelistedUsers.map(id => `<@${id}>`).join(', ') 
        : 'None';

      const embed = createEmbed({
        title: '🛡️ Anti-Nuke Protection Status',
        color: enabled ? COLORS.SUCCESS : COLORS.ERROR,
        fields: [
          { name: 'Status', value: enabled ? '🟢 Enabled' : '🔴 Disabled', inline: true },
          { name: 'Punishment', value: `\`${punishment.toUpperCase()}\``, inline: true },
          { name: 'Whitelisted Users', value: whitelistText, inline: false },
          { 
            name: 'Security Rate-Limits', 
            value: [
              `• Channel Delete: max ${limits.channelDelete.max} per ${limits.channelDelete.window}s`,
              `• Channel Create: max ${limits.channelCreate.max} per ${limits.channelCreate.window}s`,
              `• Role Delete: max ${limits.roleDelete.max} per ${limits.roleDelete.window}s`,
              `• Role Create: max ${limits.roleCreate.max} per ${limits.roleCreate.window}s`,
              `• Mass Ban: max ${limits.memberBan.max} per ${limits.memberBan.window}s`,
              `• Mass Kick: max ${limits.memberKick.max} per ${limits.memberKick.window}s`,
              `• Webhook Create: max ${limits.webhookCreate.max} per ${limits.webhookCreate.window}s`,
              `• Bot Add Protection: ${limits.botAdd.blockUnauthorized ? 'Enabled (Auto-ban unauthorized bot)' : 'Disabled'}`
            ].join('\n'), 
            inline: false 
          }
        ],
        footer: { text: 'Server Owner and Bot are immune by default.' }
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'toggle') {
      const enabled = interaction.options.getBoolean('enabled');
      db.updateGuild(guildId, g => {
        g.antinuke.enabled = enabled;
      });

      return interaction.reply({
        content: `🛡️ Anti-Nuke has been **${enabled ? 'ENABLED' : 'DISABLED'}**.`,
        ephemeral: true
      });
    }

    if (subcommand === 'punishment') {
      const action = interaction.options.getString('action');
      db.updateGuild(guildId, g => {
        g.antinuke.punishment = action;
      });

      return interaction.reply({
        content: `⚖️ Anti-Nuke punishment set to: **${action.toUpperCase()}**`,
        ephemeral: true
      });
    }

    if (subcommand === 'whitelist-add') {
      const targetUser = interaction.options.getUser('user');
      if (guildData.antinuke.whitelistedUsers.includes(targetUser.id)) {
        return interaction.reply({ content: `⚠️ <@${targetUser.id}> is already whitelisted.`, ephemeral: true });
      }

      db.updateGuild(guildId, g => {
        g.antinuke.whitelistedUsers.push(targetUser.id);
      });

      return interaction.reply({
        content: `✅ <@${targetUser.id}> has been added to the Anti-Nuke whitelist.`,
        ephemeral: true
      });
    }

    if (subcommand === 'whitelist-remove') {
      const targetUser = interaction.options.getUser('user');
      if (!guildData.antinuke.whitelistedUsers.includes(targetUser.id)) {
        return interaction.reply({ content: `⚠️ <@${targetUser.id}> is not in the whitelist.`, ephemeral: true });
      }

      db.updateGuild(guildId, g => {
        g.antinuke.whitelistedUsers = g.antinuke.whitelistedUsers.filter(id => id !== targetUser.id);
      });

      return interaction.reply({
        content: `✅ <@${targetUser.id}> was removed from the Anti-Nuke whitelist.`,
        ephemeral: true
      });
    }
  }
};
