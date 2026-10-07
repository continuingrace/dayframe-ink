import fs from 'node:fs';

let s=fs.readFileSync('v72.html','utf8').replaceAll('V72','V73');

const start=s.indexOf('function renderProcessed45(includeFrame=true){');
const end=s.indexOf('\nfunction downloadCanvas(',start);
if(start<0||end<0)throw new Error('V73 renderProcessed45 target missing');

const replacement=`function maskOutsideCutFrames(ctx,W,H,width,widthScale=1){
  // V73 isolated fix: only the SAVED 4:5 PNG is masked outside each Ink frame.
  // Frame geometry, 14px gutters, captions, V3 line texture and the long Dayframe stay untouched.
  if(mode!=='four')return;
  const visualW=Math.max(1,width*widthScale),inset=Math.max(3,visualW*.58+1.5);
  ctx.save();ctx.fillStyle='#F8F7F5';
  panelBoxesFor(W,H).forEach(b=>{
    const e=frameEdgeCoords(b,W,H,inset),r=b.x+b.w,bt=b.y+b.h;
    if(e.t>b.y)ctx.fillRect(b.x,b.y,b.w,e.t-b.y);
    if(bt>e.b)ctx.fillRect(b.x,e.b,b.w,bt-e.b);
    if(e.l>b.x)ctx.fillRect(b.x,e.t,e.l-b.x,Math.max(0,e.b-e.t));
    if(r>e.r)ctx.fillRect(e.r,e.t,r-e.r,Math.max(0,e.b-e.t));
  });
  ctx.restore()
}
function renderProcessed45(includeFrame=true){
  const out=document.createElement('canvas');out.width=1080;out.height=1350;
  const x=out.getContext('2d');
  if(mode==='four')drawNormalizedFour(x,out.width,out.height);
  else{drawEdit();x.fillStyle='#fff';x.fillRect(0,0,out.width,out.height);x.drawImage(EC,0,0,out.width,out.height)}
  if(includeFrame){
    // Preserve V72's approved V3 drawing scale. Mask only the pixels OUTSIDE those exact frame centers.
    const ar=q('#artArea').getBoundingClientRect(),vrW=ar.width||360,vrH=ar.height||450,sx=out.width/vrW,sy=out.height/vrH;
    x.save();x.scale(sx,sy);
    maskOutsideCutFrames(x,vrW,vrH,cutFrameStyle.width,1);
    drawCutFrameSet(x,vrW,vrH,cutFrameStyle.width,cutFrameStyle.color,1);
    x.restore()
  }
  return out
}`;

s=s.slice(0,start)+replacement+s.slice(end);

if(!s.includes('V73 STATIC BUILD'))throw new Error('V73 static marker missing');
if(!s.includes('maskOutsideCutFrames(x,vrW,vrH,cutFrameStyle.width,1);'))throw new Error('V73 clipping call missing');
if(!s.includes('function renderTopArtBase(){\n  // V73: preserve the CURRENT completed 4:5 editor state'))throw new Error('Long Dayframe path changed unexpectedly');
if(!s.includes('export the text from the exact DOM layout'))throw new Error('V72 text-export stabilization missing');
if(!s.includes('function line(ctx,a,b,c,d,seed,widthScale=1,strokeColor=\'#302e2a\',baseWidth=null)'))throw new Error('V3 line function missing');
if(s.includes("fetch('./base-v59.html")||s.includes("fetch('./v66.html"))throw new Error('runtime patch chain reintroduced');

const sa=s.indexOf('<script>'),sb=s.indexOf('</script>',sa+8);
if(sa<0||sb<0)throw new Error('script missing');
new Function(s.slice(sa+8,sb));

fs.writeFileSync('v73.html',s);
const idx=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f0e7"><title>Dayframe Ink V73</title><style>html,body{margin:0;background:#f4f0e7;color:#191816;font-family:-apple-system,BlinkMacSystemFont,"Pretendard",sans-serif}body{display:grid;place-items:center;min-height:100svh;font-size:13px}</style></head><body><span>Dayframe Ink V73 여는 중…</span><script>location.replace('./v73.html'+location.search+location.hash)</script></body></html>`;
fs.writeFileSync('index.html',idx);
console.log('V73 static build OK · isolated 4:5 frame exterior mask');
