const tint={info:"\u001b[36m",warn:"\u001b[33m",error:"\u001b[31m",reset:"\u001b[0m"};
const push=(level,text,extra)=>{const fn=level==="error"?console.error:level==="warn"?console.warn:console.log;fn(`${tint[level]}[${level.toUpperCase()}]${tint.reset} ${text}${extra?` ${extra}`:""}`);};
export const logger={info:(msg,meta)=>push("info",msg,meta),warn:(msg,meta)=>push("warn",msg,meta),error:(msg,err)=>push("error",msg,err?.stack??err??"")};
