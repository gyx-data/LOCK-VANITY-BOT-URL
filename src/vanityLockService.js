import {Routes,AuditLogEvent} from "discord.js";
import {loadConfig,updateConfig} from "./configManager.js";
import {logger} from "./logger.js";
const pull=async guild=>{try{return (await guild.fetchVanityData()).code??null;}catch(err){logger.warn("vanity lookup failed",err?.code);return null;}};
export const ensureInitialLock=async client=>{
  const cfg=await loadConfig();
  const guild=await client.guilds.fetch(cfg.guildId);
  if(!guild)throw new Error("Guild not found. Check guildId in config.json.");
  const code=await pull(guild);
  if(!code){logger.warn("No vanity URL set. Needs level 3 boosts.","");return;}
  if(!cfg.lockedVanityCode){await updateConfig({lockedVanityCode:code});logger.info(`Initial lock saved ${code}`);return;}
  if(cfg.lockedVanityCode!==code){await client.rest.patch(Routes.guildVanityUrl(cfg.guildId),{body:{code:cfg.lockedVanityCode}});logger.warn(`Restored vanity ${cfg.lockedVanityCode}`);}
};
const ping=async(client,msg)=>{const cfg=await loadConfig();try{const admin=await client.users.fetch(cfg.adminId);await admin.send(`Lock Bot URL\n${msg}`);}catch(err){logger.warn("DM failed",err?.message);}};
export const enforceVanityLock=async(_old,newGuild)=>{
  if(!newGuild?.client?.isReady())return;
  const cfg=await loadConfig();
  if(newGuild.id!==cfg.guildId||!cfg.lockedVanityCode)return;
  const current=await pull(newGuild);
  if(!current||current===cfg.lockedVanityCode)return;
  try{
    const logs=await newGuild.fetchAuditLogs({type:AuditLogEvent.GuildUpdate,limit:1});
    const entry=logs.entries.first();
    const change=entry?.changes?.find(c=>c.key==="vanity_url_code");
    if(!change)logger.warn("Audit log did not show vanity change.","");
    const exec=entry?.executor?.id??null;
    if(exec&&cfg.whitelistUserIds.includes(exec)){await updateConfig({lockedVanityCode:change?.new??current});logger.info(`Change allowed by ${exec}`);return;}
    await newGuild.client.rest.patch(Routes.guildVanityUrl(newGuild.id),{body:{code:cfg.lockedVanityCode}});
    logger.warn(`Reverted vanity change by ${exec??"unknown"}`);
    await ping(newGuild.client,`Vanity reverted to ${cfg.lockedVanityCode}`);
  }catch(err){
    logger.error("Failed to enforce vanity lock",err);
    await ping(newGuild.client,`Lock error: ${err.message}`);
  }
};
