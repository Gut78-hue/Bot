require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Collection 
} = require('discord.js');
const { startKeepAliveServer } = require('./src/server');

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.User
  ]
});

client.commands = new Collection();

// 1. Load Slash Commands
function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`[Commands] Loaded: /${command.data.name}`);
      }
    }
  }
}
loadCommands(path.join(__dirname, 'src/commands'));

// 2. Load Events
function loadEvents(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      loadEvents(fullPath);
    } else if (file.endsWith('.js')) {
      const event = require(fullPath);
      if (event.name && event.execute) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`[Events] Loaded: ${event.name} (${file})`);
      }
    }
  }
}
loadEvents(path.join(__dirname, 'src/events'));

// 3. Start Render Keep-Alive HTTP Server
startKeepAliveServer();

// 4. Global Error Handlers (Prevents crashes on unhandled errors)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Anti-Crash] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.error('[Anti-Crash] Uncaught Exception:', err, 'origin:', origin);
});

// 5. Connect to Discord
if (!process.env.DISCORD_TOKEN) {
  console.warn('⚠️ WARNING: DISCORD_TOKEN is not set in environment or .env file!');
} else {
  client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('[Discord] Login failed:', err.message);
  });
}
