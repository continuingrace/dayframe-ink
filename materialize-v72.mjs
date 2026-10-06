import fs from 'node:fs';
let s=fs.readFileSync('v71.html','utf8').replaceAll('V71','V72');

const oldStart=s.indexOf('function drawWrappedExportText(');
const oldEnd=s.indexOf('\nfunction renderFinalFrame(){',oldStart);
if(oldStart<0||oldEnd<0)throw new Error('V72 export text function target missing');

const mirrorFn=`function drawWrappedExportText(ctx,item,parentRect,paperRect,scale){
  if(!item.text)return;
  // V72: export the text from the exact DOM layout that the user is previewing.
  // Do not independently recalculate wrapping / vertical clamping on the export canvas.
  const el=q('#'+item.target);if(!el)return;
  const cs=getComputedStyle(el),node=el.firstChild;if(!node||node.nodeType!==Node.TEXT_NODE)return;
  const fontSize=parseFloat(cs.fontSize)||item.size||16;
  ctx.save();
  ctx.font=fontSize*scale+'px '+cs.fontFamily;
  ctx.fillStyle=cs.color||item.color;
  ctx.textAlign='center';ctx.textBaseline='middle';
  const text=node.textContent||'',range=document.createRange();let offset=0;
  for(const ch of Array.from(text)){
    const next=offset+ch.length;
    if(ch!=='\\n'&&ch!=='\\r'&&ch!==' '&&ch!=='\\t'){
      range.setStart(node,offset);range.setEnd(node,next);
      const r=range.getBoundingClientRect();
      if(r.width||r.height){
        const px=(r.left+r.width/2-paperRect.left)*scale;
        const py=(r.top+r.height/2-paperRect.top)*scale;
        ctx.fillText(ch,px,py);
      }
    }
    offset=next;
  }
  range.detach?.();ctx.restore();
}`;
s=s.slice(0,oldStart)+mirrorFn+s.slice(oldEnd);

const oldRender='render();drawPlacedArt();applyOuter();updateGuides();';
if(!s.includes(oldRender))throw new Error('V72 renderFinalFrame target missing');
s=s.replace(oldRender,'render();drawPlacedArt();updateGuides();');

if(!s.includes('export the text from the exact DOM layout')||s.includes('render();drawPlacedArt();applyOuter();updateGuides();'))throw new Error('V72 invariants failed');
const sa=s.indexOf('<script>'),sb=s.indexOf('</script>',sa+8);if(sa<0||sb<0)throw new Error('script missing');new Function(s.slice(sa+8,sb));
fs.writeFileSync('v72.html',s);
const idx=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f0e7"><title>Dayframe Ink V72</title><style>html,body{margin:0;background:#f4f0e7;color:#191816;font-family:-apple-system,BlinkMacSystemFont,"Pretendard",sans-serif}body{display:grid;place-items:center;min-height:100svh;font-size:13px}</style></head><body><span>Dayframe Ink V72 여는 중…</span><script>location.replace('./v72.html'+location.search+location.hash)</script></body></html>`;
fs.writeFileSync('index.html',idx);
console.log('V72 static build OK');
