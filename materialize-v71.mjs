import fs from 'node:fs';
let s=fs.readFileSync('v70.html','utf8').replaceAll('V70','V71');
const must=(from,to,label)=>{if(!s.includes(from))throw new Error('V71 target missing: '+label);s=s.replace(from,to)};

must(`<section class="wf setupwf"><h2>2 · 오늘의 기록과 가변 조건</h2><textarea id="diary" class="field area" placeholder="오늘 있었던 일을 자유롭게 적어주세요."></textarea>`,`<section class="wf setupwf"><h2>2 · 오늘의 기록과 가변 조건</h2><div class="todayResetBar"><p class="hint">새 기록을 시작할 때 오늘 입력값만 비웁니다. 캐릭터 정체성·승인 스타일·옆모습 기준·고정 가이드는 유지됩니다.</p><button class="action" id="resetToday" type="button">오늘 기록 새로 시작 · 가변값 리셋</button></div><textarea id="diary" class="field area" placeholder="오늘 있었던 일을 자유롭게 적어주세요."></textarea>`,`reset button`);

must(`  const n=q('#name').value.trim()||'MY CHARACTER',extra=q('#notes').value.trim();`,`  const n=q('#name').value.trim()||'MY CHARACTER',rawExtra=q('#notes').value.trim();
  // V71: keep stored notes, but never mix a legacy full style guide into v2.2.
  const legacyExtra=/IHIRI MINIMI HANJI SOFT WASH\s*v1\.3|soft brown-black/i.test(rawExtra);
  const extra=legacyExtra?'':rawExtra;`,`legacy identity filter`);

must(`['name','notes','diary','dailyLook','dailyPlace','exactPlaceText','cutDirection'].forEach(id=>q('#'+id).oninput=()=>localStorage.setItem('dayframeInk.'+id,q('#'+id).value));`,`['name','notes','diary','dailyLook','dailyPlace','exactPlaceText','cutDirection'].forEach(id=>q('#'+id).oninput=()=>localStorage.setItem('dayframeInk.'+id,q('#'+id).value));
q('#resetToday').onclick=()=>{
  if(!confirm('오늘 입력값과 오늘 참고 이미지만 비우고 새 기록을 시작할까요? 캐릭터 정체성·승인 스타일·IMG_9121 기준·이름·고정 정체성 메모는 유지됩니다.'))return;
  archivePrompt(q('#prompt').value);
  ['diary','dailyLook','dailyPlace','exactPlaceText','cutDirection'].forEach(id=>{q('#'+id).value='';localStorage.removeItem('dayframeInk.'+id)});
  dailyRefs.length=0;renderDailyRefs();saveDailyRefs();q('#dailyRefs').value='';
  sceneData=[];q('#scenes').innerHTML='';
  q('#prompt').value='';localStorage.removeItem('dayframeInk.prompt.current');
  q('#promptQA').textContent='새 오늘 기록을 시작했습니다. 고정 정체성·스타일 기준은 그대로 유지됩니다.';
  window.scrollTo({top:q('#diary').getBoundingClientRect().top+window.scrollY-24,behavior:'smooth'});
};`,`reset handler`);

must(`q('#promptQA').textContent=!legacy.length&&ordered?'✓ v2.2 단일 고정 가이드 · 구형 17%/114px/v1.3 없음 · 스타일/레이아웃 역할 분리 · 섹션 순서 정상':'⚠️ 프롬프트 검수 필요: '+(legacy.length?'구형 문구 '+legacy.join(', ')+' ':'')+(ordered?'':'섹션 순서 오류');`,`q('#promptQA').textContent=!legacy.length&&ordered?(legacyExtra?'✓ v2.2 단일 고정 가이드 · 저장된 구형 v1.3 추가 메모는 이번 프롬프트에서 자동 제외 · 섹션 순서 정상':'✓ v2.2 단일 고정 가이드 · 구형 17%/114px/v1.3 없음 · 스타일/레이아웃 역할 분리 · 섹션 순서 정상'):'⚠️ 프롬프트 검수 필요: '+(legacy.length?'구형 문구 '+legacy.join(', ')+' ':'')+(ordered?'':'섹션 순서 오류');`,`QA status`);

s=s.replace('</style>','\n.todayResetBar{margin:0 0 18px;padding:14px 14px 16px;border:1px solid #ddd7cb;border-radius:18px;background:#faf8f3}.todayResetBar .hint{margin:0 0 10px}.todayResetBar .action{margin:0}\n</style>');
if(!s.includes('id="resetToday"')||!s.includes('dailyRefs.length=0')||s.includes('DAYFRAME INK — V70 IMAGE PROMPT'))throw new Error('V71 invariants failed');
const sa=s.indexOf('<script>'),sb=s.indexOf('</script>',sa+8);if(sa<0||sb<0)throw new Error('script missing');new Function(s.slice(sa+8,sb));
fs.writeFileSync('v71.html',s);
const idx=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f0e7"><title>Dayframe Ink V71</title><style>html,body{margin:0;background:#f4f0e7;color:#191816;font-family:-apple-system,BlinkMacSystemFont,"Pretendard",sans-serif}body{display:grid;place-items:center;min-height:100svh;font-size:13px}</style></head><body><span>Dayframe Ink V71 여는 중…</span><script>location.replace('./v71.html'+location.search+location.hash)</script></body></html>`;
fs.writeFileSync('index.html',idx);
console.log('V71 static build OK');
