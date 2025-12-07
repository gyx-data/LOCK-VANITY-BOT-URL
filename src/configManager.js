import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
const file=resolve(process.cwd(),"config.json");
let cache;
const clone=data=>JSON.parse(JSON.stringify(data));
const guard=cfg=>{
  for(const key of ["token","clientId","guildId","adminId"])if(cfg[key]===undefined||cfg[key]===null||cfg[key]==="")throw new Error(`config.json missing ${key}`);
  if(!Array.isArray(cfg.whitelistUserIds))throw new Error("config.json whitelistUserIds must be array");
};
export const loadConfig=async({force=!1}={})=>{
  if(!cache||force){cache=JSON.parse(await readFile(file,"utf8"));guard(cache);}return clone(cache);
};
export const updateConfig=async(patch)=>{
  const base=await loadConfig();
  const next={...base,...patch,whitelistUserIds:patch.whitelistUserIds?[...new Set(patch.whitelistUserIds.map(String))]:base.whitelistUserIds};
  guard(next);
  await writeFile(file,`${JSON.stringify(next,null,2)}\n`,"utf8");
  cache=next;
  return clone(next);
};
