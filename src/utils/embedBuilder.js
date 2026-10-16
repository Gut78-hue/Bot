const { EmbedBuilder } = require('discord.js');

const COLORS = {
  DEFAULT: 0x5865F2, // Blurple
  SUCCESS: 0x57F287, // Green
  WARNING: 0xFEE75C, // Yellow
  ERROR: 0xED4245,   // Red
  DARK: 0x2B2D31     // Discord Dark
};

function createEmbed({ title, description, color = COLORS.DEFAULT, fields = [], footer, thumbnail }) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTimestamp();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (fields.length) embed.addFields(fields);
  if (footer) embed.setFooter(typeof footer === 'string' ? { text: footer } : footer);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

module.exports = {
  COLORS,
  createEmbed
};
