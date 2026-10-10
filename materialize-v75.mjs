import fs from 'node:fs';

let s=fs.readFileSync('v74.html','utf8').replaceAll('V74','V75');

// V75: restore the protected V47 caption-Y contract only.
// The Y slider is the FIRST LINE top anchor inside each 147px caption strip.
// Its usable range must not shrink just because one CUT wraps to more lines.
const oldClamp="const bottomPad=Math.max(3,b.h*.025),minY=b.y,maxY=Math.max(minY,b.y+b.h-bottomPad-blockH);";
const newClamp="const bottomPad=Math.max(3,b.h*.025),minY=b.y,maxY=Math.max(minY,b.y+b.h-bottomPad-t.size);";
if(!s.includes(oldClamp))throw new Error('caption Y clamp target missing');
s=s.replace(oldClamp,newClamp);

// Update the nearby comments so future edits do not reintroduce the multiline-height clamp.
s=s.replace(
  '// Keep the whole multiline block inside the detected strip at both extremes.',
  '// V75/V47: keep the FIRST LINE anchor range identical across CUTs, regardless of wrapped line count.'
);

// Regression guards: this release must remain a surgical 4:5 caption-position fix.
if(!s.includes('V75 STATIC BUILD'))throw new Error('V75 static marker missing');
if(!s.includes('maxY=Math.max(minY,b.y+b.h-bottomPad-t.size)'))throw new Error('V75 first-line Y clamp missing');
if(s.includes('maxY=Math.max(minY,b.y+b.h-bottomPad-blockH)'))throw new Error('old multiline Y clamp still present');
if(!s.includes('function localPos(i,t)'))throw new Error('V47 local caption coordinate system missing');
if(!s.includes('function setLocalPos(i,t,lx,ly)'))throw new Error('V47 local caption setter missing');
if(!s.includes('모든 CUT의 중심 X와 첫 줄 상단 Y를 같은 지문란 좌표로 맞췄습니다.'))throw new Error('V47 apply-all behavior missing');
if(!s.includes('maskOutsideCutFrames'))throw new Error('V73 4:5 clipping regression');
if(!s.includes('export the text from the exact DOM layout'))throw new Error('V72 long export stabilization regression');
if(!s.includes("function line(ctx,a,b,c,d,seed,widthScale=1,strokeColor='#302e2a',baseWidth=null)"))throw new Error('V3 line regression');
if(!s.includes('function renderTopArtBase(){'))throw new Error('long Dayframe path regression');
if(!s.includes('# DAYFRAME INK × IHIRI — 고정 이미지 가이드 v2.4'))throw new Error('V74 fixed guide regression');
if(s.includes("fetch('./base-v59.html")||s.includes("fetch('./v66.html"))throw new Error('runtime patch chain reintroduced');

const sa=s.indexOf('<script>'),sb=s.indexOf('</script>',sa+8);
if(sa<0||sb<0)throw new Error('script missing');
new Function(s.slice(sa+8,sb));

fs.writeFileSync('v75.html',s);
const idx='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f0e7"><title>Dayframe Ink V75</title><style>html,body{margin:0;background:#f4f0e7;color:#191816;font-family:-apple-system,BlinkMacSystemFont,"Pretendard",sans-serif}body{display:grid;place-items:center;min-height:100svh;font-size:13px}</style></head><body><span>Dayframe Ink V75 여는 중…</span><script>location.replace(\'./v75.html\'+location.search+location.hash)</script></body></html>';
fs.writeFileSync('index.html',idx);
console.log('V75 static build OK · CUT caption first-line Y range restored');
