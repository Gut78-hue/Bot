const { 
  ChannelType, 
  PermissionFlagsBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  AttachmentBuilder 
} = require('discord.js');
const db = require('./database');
const { createEmbed, COLORS } = require('./embedBuilder');

class TicketHandler {
  async handleButton(interaction) {
    const { customId, guild, user, member } = interaction;

    if (customId === 'btn_create_ticket') {
      return this.createTicket(interaction);
    }

    if (customId === 'btn_close_ticket') {
      return this.closeTicket(interaction);
    }

    if (customId === 'btn_claim_ticket') {
      return this.claimTicket(interaction);
    }
  }

  async createTicket(interaction) {
    const { guild, user } = interaction;
    const guildData = db.getGuild(guild.id);
    const { categoryId, supportRoleId } = guildData.tickets;

    if (!categoryId || !supportRoleId) {
      return interaction.reply({
        content: '⚠️ The ticket system has not been configured yet. An administrator must run `/ticket-setup`.',
        ephemeral: true
      });
    }

    // Check if user already has an active ticket
    const activeTickets = Object.entries(guildData.tickets.active);
    const existing = activeTickets.find(([_, t]) => t.ownerId === user.id && !t.closed);
    if (existing) {
      return interaction.reply({
        content: `❌ You already have an open ticket in <#${existing[0]}>! Please close it before opening a new one.`,
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    guildData.tickets.counter += 1;
    const ticketNumber = String(guildData.tickets.counter).padStart(4, '0');
    const channelName = `ticket-${ticketNumber}`;

    try {
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: user.id, // Ticket owner
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: supportRoleId, // Support staff
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: guild.client.user.id, // Bot itself
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageMessages
            ]
          }
        ]
      });

      // Save active ticket in database
      db.updateGuild(guild.id, g => {
        g.tickets.active[channel.id] = {
          ownerId: user.id,
          createdAt: Date.now(),
          closed: false
        };
      });

      const welcomeEmbed = createEmbed({
        title: `🎫 Ticket #${ticketNumber}`,
        description: `Hello <@${user.id}>! Thank you for contacting support.\nPlease describe your issue or inquiry in detail, and a staff member (<@&${supportRoleId}>) will be with you shortly.`,
        color: COLORS.DEFAULT,
        fields: [
          { name: 'Opened By', value: `<@${user.id}>`, inline: true },
          { name: 'Created At', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
        ],
        footer: { text: 'Use the buttons below to manage this ticket.' }
      });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('btn_close_ticket')
          .setLabel('Close Ticket')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('btn_claim_ticket')
          .setLabel('Claim Ticket')
          .setEmoji('🙋')
          .setStyle(ButtonStyle.Success)
      );

      await channel.send({
        content: `<@${user.id}> | <@&${supportRoleId}>`,
        embeds: [welcomeEmbed],
        components: [buttons]
      });

      await interaction.editReply({
        content: `✅ Your ticket has been created: <#${channel.id}>`
      });
    } catch (err) {
      console.error('[Tickets] Failed to create ticket channel:', err);
      await interaction.editReply({
        content: '❌ Failed to create ticket channel. Please make sure the bot has `Manage Channels` permission and that the ticket category exists.'
      });
    }
  }

  async claimTicket(interaction) {
    const { guild, member, user, channel } = interaction;
    const guildData = db.getGuild(guild.id);
    const { supportRoleId } = guildData.tickets;

    // Check if user is staff or administrator
    const isStaff = member.roles.cache.has(supportRoleId) || member.permissions.has(PermissionFlagsBits.Administrator);
    if (!isStaff) {
      return interaction.reply({
        content: '❌ Only staff members can claim tickets.',
        ephemeral: true
      });
    }

    const embed = createEmbed({
      description: `🙋 **Ticket Claimed:** <@${user.id}> will be handling this ticket!`,
      color: COLORS.SUCCESS
    });

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ You claimed this ticket.', ephemeral: true });
  }

  async closeTicket(interaction) {
    const { guild, channel, user } = interaction;
    const guildData = db.getGuild(guild.id);
    const ticketInfo = guildData.tickets.active[channel.id];

    await interaction.reply({
      content: '🔒 Closing ticket and archiving transcript in 5 seconds...'
    });

    try {
      // Fetch up to 100 messages for transcript
      const messages = await channel.messages.fetch({ limit: 100 });
      const sorted = Array.from(messages.values()).reverse();

      let transcriptText = `--- TICKET TRANSCRIPT FOR #${channel.name} ---\n`;
      transcriptText += `Guild: ${guild.name} (${guild.id})\n`;
      transcriptText += `Closed By: ${user.tag} (${user.id})\n`;
      transcriptText += `Exported At: ${new Date().toISOString()}\n\n`;

      for (const msg of sorted) {
        const time = new Date(msg.createdTimestamp).toLocaleTimeString();
        transcriptText += `[${time}] ${msg.author.tag}: ${msg.content || (msg.attachments.size ? '[Attachment]' : '')}\n`;
      }

      const buffer = Buffer.from(transcriptText, 'utf-8');
      const attachment = new AttachmentBuilder(buffer, { name: `${channel.name}-transcript.txt` });

      // Send to log channel if set
      if (guildData.tickets.logChannelId) {
        const logChannel = await guild.channels.fetch(guildData.tickets.logChannelId).catch(() => null);
        if (logChannel && logChannel.isTextBased()) {
          const logEmbed = createEmbed({
            title: '📁 Ticket Closed & Archived',
            color: COLORS.DARK,
            fields: [
              { name: 'Ticket Name', value: channel.name, inline: true },
              { name: 'Closed By', value: `<@${user.id}>`, inline: true },
              { name: 'Owner', value: ticketInfo ? `<@${ticketInfo.ownerId}>` : 'Unknown', inline: true }
            ]
          });
          await logChannel.send({ embeds: [logEmbed], files: [attachment] }).catch(() => null);
        }
      }

      // Cleanup db
      db.updateGuild(guild.id, g => {
        delete g.tickets.active[channel.id];
      });

      // Countdown and delete channel
      setTimeout(async () => {
        await channel.delete('Ticket closed').catch(() => null);
      }, 5000);
    } catch (err) {
      console.error('[Tickets] Error closing ticket:', err);
      setTimeout(async () => {
        await channel.delete().catch(() => null);
      }, 3000);
    }
  }
}

module.exports = new TicketHandler();
