import fs from 'node:fs/promises';

const source = await fs.readFile('v67.html','utf8');
const baseDir = process.cwd();
let output = '';
let resolveDone, rejectDone;
const done = new Promise((resolve,reject)=>{resolveDone=resolve;rejectDone=reject});

function cleanPath(url){
  const raw=String(url).split('?')[0].replace(/^\.\//,'');
  if(!/^[a-zA-Z0-9._/-]+$/.test(raw) || raw.includes('..')) throw new Error('Unsafe local fetch: '+url);
  return raw;
}

globalThis.fetch = async url => {
  const path=cleanPath(url);
  try{
    const text=await fs.readFile(baseDir+'/'+path,'utf8');
    return {ok:true,status:200,text:async()=>text};
  }catch(err){
    return {ok:false,status:404,text:async()=>''};
  }
};

globalThis.document = {
  body:{innerHTML:''},
  open(){output=''},
  write(s){output+=String(s)},
  close(){resolveDone()}
};

const match=source.match(/<script>([\s\S]*?)<\/script>/);
if(!match) throw new Error('V68 loader script not found');
try{
  Function(match[1])();
  await Promise.race([done,new Promise((_,reject)=>setTimeout(()=>reject(new Error('materialize timeout')),5000))]);
}catch(err){rejectDone?.(err);throw err}

if(!output.includes('<!doctype html>') || !output.includes('Dayframe Ink')) throw new Error('Materialized output is incomplete');
if(output.includes("fetch('./base-v59.html") || output.includes("fetch('./v66.html")) throw new Error('Runtime loader remained in materialized output');
output=output.replaceAll('V68','V69').replaceAll('v=68-base','v=69-base');
output=output.replace('</head>','<!-- V69 STATIC BUILD: no runtime HTML fetch/patch chain. Generated from reviewed V68 once at build time. --></head>');

// Syntax-check the actual app script before publishing.
const appScripts=[...output.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(!appScripts.length) throw new Error('No app scripts in materialized output');
for(const code of appScripts) new Function(code);

await fs.writeFile('v69.html',output,'utf8');
const index='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f0e7"><title>Dayframe Ink V69</title><style>html,body{margin:0;background:#f4f0e7;color:#191816;font-family:-apple-system,BlinkMacSystemFont,"Pretendard",sans-serif}body{display:grid;place-items:center;min-height:100svh;font-size:13px}</style></head><body><span>Dayframe Ink V69 여는 중…</span><script>location.replace(\'./v69.html\'+location.search+location.hash)</script></body></html>';
await fs.writeFile('index.html',index,'utf8');
console.log('V69 static build written:',output.length,'bytes');
