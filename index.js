import {Client,GatewayIntentBits} from "discord.js";
import {loadConfig} from "./src/configManager.js";
import {logger} from "./src/logger.js";
import {ensureInitialLock,enforceVanityLock} from "./src/vanityLockService.js";
import {command as lockCommand,run as runLockCommand} from "./commands/lockurl.js";

(async()=>{
  const config=await loadConfig();
  const client=new Client({intents:[GatewayIntentBits.Guilds]});
  client.once("ready",async()=>{
    logger.info(`ready ${client.user.tag}`);
    await ensureInitialLock(client);
  });
  client.on("guildUpdate",async(before,after)=>{await enforceVanityLock(before,after);});
  client.on("interactionCreate",async interaction=>{
    if(!interaction.isChatInputCommand())return;
    if(interaction.commandName===lockCommand.name)await runLockCommand(interaction);
  });
  client.on("error",err=>logger.error("ws",err));
  client.on("shardError",err=>logger.error("shard",err));
  process.on("unhandledRejection",err=>logger.error("promise",err));
  await client.login(config.token);
})();
