import { Client, GatewayIntentBits } from "discord.js";
import { loadConfig } from "./configManager.js";
import { logger } from "./logger.js";
import {
  ensureInitialLock,
  enforceVanityLock
} from "./vanityLockService.js";
import { execute as executeLockCommand, data as lockCommandData } from "./commands/lockurl.js";

(async () => {
  const config = await loadConfig();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  client.once("ready", async () => {
    logger.info(`Logged in as ${client.user.tag}`);
    await ensureInitialLock(client);
  });

  client.on("guildUpdate", async (oldGuild, newGuild) => {
    await enforceVanityLock(oldGuild, newGuild);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (interaction.commandName === lockCommandData.name) {
      await executeLockCommand(interaction);
    }
  });

  client.on("error", (error) => logger.error("WS error", error));
  client.on("shardError", (error) => logger.error("Shard error", error));
  process.on("unhandledRejection", (error) =>
    logger.error("Unhandled rejection", error)
  );

  await client.login(config.token);
})();
