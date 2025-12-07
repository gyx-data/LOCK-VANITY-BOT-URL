import {SlashCommandBuilder,Routes} from "discord.js";
import {loadConfig,updateConfig} from "../src/configManager.js";
import {logger} from "../src/logger.js";
const pattern=/^[a-z0-9-]{2,32}$/i;
export const command=new SlashCommandBuilder()
  .setName("lockurl")
  .setDescription("Manage the server vanity URL")
  .setDMPermission(!1)
  .addSubcommand(sub=>sub.setName("status").setDescription("Show lock status"))
  .addSubcommand(sub=>sub.setName("set").setDescription("Lock a new code").addStringOption(option=>option.setName("code").setDescription("Code length 2-32").setMinLength(2).setMaxLength(32).setRequired(!0)))
  .addSubcommandGroup(group=>group.setName("whitelist").setDescription("Manage allowed users").addSubcommand(sub=>sub.setName("add").setDescription("Add user").addUserOption(option=>option.setName("user").setDescription("Discord user").setRequired(!0))).addSubcommand(sub=>sub.setName("remove").setDescription("Remove user").addUserOption(option=>option.setName("user").setDescription("Discord user").setRequired(!0))));

export const run=async interaction=>{
  const config=await loadConfig();
  if(interaction.user.id!==config.adminId){await interaction.reply({content:"You are not allowed to use this command.",ephemeral:!0});return;}
  if(interaction.guildId!==config.guildId){await interaction.reply({content:"This guild is not allowed.",ephemeral:!0});return;}
  const group=interaction.options.getSubcommandGroup(!1);
  const sub=interaction.options.getSubcommand();
  if(!group&&sub==="status"){await interaction.reply({content:`Locked code: ${config.lockedVanityCode||"none"}\nWhitelist: ${config.whitelistUserIds.length?config.whitelistUserIds.map(id=>`<@${id}>`).join(", "):"empty"}`,ephemeral:!0});return;}
  if(!group&&sub==="set"){
    const wanted=interaction.options.getString("code",!0).toLowerCase();
    if(!pattern.test(wanted)){await interaction.reply({content:"Code format is invalid.",ephemeral:!0});return;}
    try{
      await interaction.client.rest.patch(Routes.guildVanityUrl(config.guildId),{body:{code:wanted}});
      await updateConfig({lockedVanityCode:wanted});
      logger.info(`vanity locked ${wanted}`);
      await interaction.reply({content:`Locked to \`${wanted}\`.`,ephemeral:!0});
    }catch(err){
      logger.error("vanity update",err);
      await interaction.reply({content:"Cannot change the vanity. Check permissions and boosts.",ephemeral:!0});
    }
    return;
  }
  if(group==="whitelist"){
    const target=interaction.options.getUser("user",!0);
    const list=new Set(config.whitelistUserIds);
    if(sub==="add"){
      list.add(target.id);
      const next=await updateConfig({whitelistUserIds:[...list]});
      await interaction.reply({content:`Added <@${target.id}>\nWhitelist: ${next.whitelistUserIds.map(id=>`<@${id}>`).join(", ")||"empty"}`,ephemeral:!0});
      return;
    }
    if(sub==="remove"){
      if(target.id===config.adminId){await interaction.reply({content:"Admin user cannot be removed.",ephemeral:!0});return;}
      list.delete(target.id);
      const next=await updateConfig({whitelistUserIds:[...list]});
      await interaction.reply({content:`Removed <@${target.id}>\nWhitelist: ${next.whitelistUserIds.map(id=>`<@${id}>`).join(", ")||"empty"}`,ephemeral:!0});
    }
  }
};
