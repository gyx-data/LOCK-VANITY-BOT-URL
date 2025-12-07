import {REST,Routes} from "discord.js";
import {loadConfig} from "../src/configManager.js";
import {logger} from "../src/logger.js";
import {command} from "./lockurl.js";
(async()=>{
  const config=await loadConfig();
  const rest=new REST({version:"10"}).setToken(config.token);
  logger.info("deploying /lockurl");
  await rest.put(Routes.applicationGuildCommands(config.clientId,config.guildId),{body:[command.toJSON()]});
  logger.info("command deployed");
})().catch(err=>{logger.error("register",err);process.exitCode=1;});
