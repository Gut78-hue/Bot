const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.data = {
      guilds: {}
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[Database] Failed to load data:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to save data:', err);
    }
  }

  getGuild(guildId) {
    if (!this.data.guilds[guildId]) {
      this.data.guilds[guildId] = {
        antinuke: {
          enabled: true,
          punishment: 'ban', // 'ban' | 'kick' | 'strip_roles'
          whitelistedUsers: [],
          limits: {
            channelDelete: { max: 2, window: 10 },
            channelCreate: { max: 3, window: 10 },
            roleDelete: { max: 2, window: 10 },
            roleCreate: { max: 3, window: 10 },
            memberBan: { max: 2, window: 10 },
            memberKick: { max: 3, window: 10 },
            webhookCreate: { max: 2, window: 10 },
            botAdd: { blockUnauthorized: true }
          }
        },
        logging: {
          channelId: null,
          events: {
            antinuke: true,
            messages: true,
            members: true,
            channels: true,
            roles: true,
            voice: true
          }
        },
        tickets: {
          categoryId: null,
          supportRoleId: null,
          logChannelId: null,
          counter: 0,
          active: {} // [channelId]: { ownerId, createdAt, closed: false }
        }
      };
      this.save();
    }
    return this.data.guilds[guildId];
  }

  updateGuild(guildId, updater) {
    const guild = this.getGuild(guildId);
    updater(guild);
    this.save();
    return guild;
  }
}

module.exports = new Database();
