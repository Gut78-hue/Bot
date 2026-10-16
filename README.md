# 🛡️ Discord Sentinel Bot (Anti-Nuke, Tickets & Advanced Logging)

A modular, production-ready Discord bot built with **discord.js v14** and **Node.js 20**, specifically designed for **24/7 hosting on Render.com** (or Railway / VPS).

---

## ✨ Features

### 1. 🛡️ Real-Time Anti-Nuke System
* **Rate-Limit Enforcement:** Detects and immediately counters mass destructive actions within seconds:
  * Mass Channel Deletions & Creations
  * Mass Role Deletions & Creations
  * Mass Member Bans & Kicks
  * Webhook Spam
* **Unauthorized Bot Protection:** Automatically bans unauthorized bots and punishes whoever invited them.
* **Smart Whitelist:** Server owner and trusted administrators are immune from false positives.
* **Configurable Punishment:** Choose between `ban`, `kick`, or `strip_roles` via `/antinuke punishment`.

### 2. 🎫 Interactive Ticket System
* **Button-Based Panel:** Users click a `Create Ticket 🎫` button to instantly spin up a private text channel.
* **Role Permissions:** Automatically isolates the ticket so only the creator and support staff can view and reply.
* **Staff Actions:**
  * **Claim Ticket:** Assigns staff member to the ticket.
  * **Close & Transcript:** Generates an archived `.txt` transcript file with timestamped message logs sent to your transcript channel.

### 3. 📜 Comprehensive Server Logging
* **Message Logs:** Deleted messages and message edit history (before & after).
* **Member Logs:** Joins (with account creation age), leaves, and kicks.
* **Channel & Role Logs:** Creation, deletion, name & permission modifications.
* **Voice Logs:** Track joins, leaves, and channel switches.
* **Security Logs:** Dedicated alerts when anti-nuke triggers or actions are punished.

### 4. 🌐 24/7 Render.com Compatibility
* **Integrated Keep-Alive Server:** Built-in HTTP health check endpoint (`GET /` and `/health`) that binds to `PORT`.
* Can be deployed as a **Web Service** on Render and kept alive 24/7 using a free uptime monitor (e.g. UptimeRobot) or run as a Background Worker.

---

## 🚀 Setup & Deployment Guide

### Step 1: Discord Developer Portal Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications) and create a **New Application**.
2. Go to the **Bot** tab:
   * Click **Reset Token** and copy your bot token (`DISCORD_TOKEN`).
   * Enable the 3 **Privileged Gateway Intents**:
     * ✅ **Presence Intent**
     * ✅ **Server Members Intent**
     * ✅ **Message Content Intent**
3. Go to **OAuth2 -> URL Generator**:
   * Scopes: `bot`, `applications.commands`
   * Permissions: `Administrator` (or *Manage Channels, Manage Roles, Ban Members, Kick Members, View Audit Log, Send Messages, Attach Files*)
   * Invite the bot to your Discord server using the generated URL.

---

### Step 2: Register Slash Commands
Run this command once locally or from your deployment environment to register the slash commands:
```bash
npm run deploy
```
*(Requires `DISCORD_TOKEN` and `CLIENT_ID` set in `.env`)*

---

### Step 3: Deploy to Render.com (Free 24/7 Hosting)
1. Fork or push this repository to your **GitHub** account.
2. Log into [Render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Fill in the settings:
   * **Name:** `my-discord-bot`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`
6. Scroll down to **Environment Variables** and add:
   * `DISCORD_TOKEN` = `your_bot_token_here`
   * `CLIENT_ID` = `your_application_id_here`
   * `OWNER_ID` = `your_discord_user_id_here`
7. Click **Create Web Service**.

> **Keep-Alive Tip for Render Free Tier:**
> Render free web services sleep after 15 minutes of inactivity. Go to [UptimeRobot.com](https://uptimerobot.com) (free) and set up an **HTTP(s) Monitor** pointing to your Render app URL (e.g., `https://your-bot-name.onrender.com/health`) with an interval of **5 minutes**. Your bot will remain online 24/7!

---

## 📋 Slash Commands Reference

| Command | Description |
| :--- | :--- |
| `/antinuke status` | View current security status, limits, and whitelist |
| `/antinuke toggle` | Enable or disable anti-nuke defense |
| `/antinuke punishment` | Select punishment (`ban`, `kick`, `strip_roles`) |
| `/antinuke whitelist-add` | Add an administrator to the trusted whitelist |
| `/antinuke whitelist-remove` | Remove user from the whitelist |
| `/ticket-setup` | Configure ticket category, staff role & transcript channel |
| `/ticket-panel` | Send the interactive ticket panel with button into a channel |
| `/setlogs channel` | Set the channel where server logs are dispatched |
| `/setlogs toggle` | Enable/disable specific log categories |
| `/setlogs status` | View active log modules |
| `/ping` | Check bot latency and uptime |
| `/help` | Complete help guide |
