# 🔴 Lock Bot URL — GYX BOTS

Discord bot (Node.js ≥ 20) that keeps a guild vanity URL locked.

## Stack
- Node 20+
- discord.js 14

## Quick start
```bash
git clone https://github.com/gyx-data/LOCK-VANITY-BOT-URL.git
cd lock-bot-url
npm install
```
Fill `config.json` with your `token`, `clientId`, `guildId`, `adminId`, and `whitelistUserIds`. Leave `lockedVanityCode` empty to capture the current vanity on first login.

Give the bot **Administrator** permission (includes *Manage Guild*) and audit-log access.

## Slash command deploy
```bash
npm run register:commands
```
Publishes `/lockurl` in the target guild.

### Subcommands
- `/lockurl status`
- `/lockurl set code:<string>`
- `/lockurl whitelist add user:<@id>`
- `/lockurl whitelist remove user:<@id>`

Only the user set as `adminId` can run these commands, and only inside `guildId`.

## Run the bot
```bash
npm start
```
The bot restores the saved vanity code and DMs the admin when it blocks a change.

## Credit
Project by **GYX BOTS** 🔴
