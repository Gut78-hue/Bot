const ticketHandler = require('../../utils/ticketHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // 1. Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({ content: 'Command not found.', ephemeral: true });
      }

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(`[Command Error] /${interaction.commandName}:`, err);
        const replyPayload = {
          content: '❌ An error occurred while executing this command.',
          ephemeral: true
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyPayload).catch(() => null);
        } else {
          await interaction.reply(replyPayload).catch(() => null);
        }
      }
      return;
    }

    // 2. Handle Button Interactions (Tickets)
    if (interaction.isButton()) {
      try {
        await ticketHandler.handleButton(interaction);
      } catch (err) {
        console.error('[Button Error]:', err);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Interaction failed.', ephemeral: true }).catch(() => null);
        }
      }
      return;
    }
  }
};
