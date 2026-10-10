import fs from 'node:fs';

let s=fs.readFileSync('v73.html','utf8').replaceAll('V73','V74');
const guide=fs.readFileSync('ihiri-fixed-guide-v2.4.md','utf8').trim();

// Replace only the fixed guide UI. Editing/export/frame code remains byte-for-byte inherited from V73.
const taStart=s.indexOf('<textarea id="styleGuide"');
const taOpen=s.indexOf('>',taStart);
const taEnd=s.indexOf('</textarea>',taOpen);
if(taStart<0||taOpen<0||taEnd<0)throw new Error('styleGuide textarea missing');
s=s.slice(0,taOpen+1)+guide+s.slice(taEnd);

const lockStart=s.indexOf('<div class="identitylock">',s.indexOf('반드시 유지할 특징'));
const lockEnd=s.indexOf('</div>',lockStart);
if(lockStart<0||lockEnd<0)throw new Error('identity lock summary missing');
const lock='<div class="identitylock"><strong>항상 고정 적용 · DAYFRAME INK × IHIRI v2.4</strong>승인 CUT 1 얼굴형=하관 폭·자연스러운 U자 턱 · 승인 스타일 이미지=중성적인 물 빠진 회차콜 머리·명도/채도/대비·채색 밀도 · IMG_9121=아주 작은 옆모습 코 · 오늘 의상·장소·소품은 매번 가변</div>';
s=s.slice(0,lockStart)+lock+s.slice(lockEnd+'</div>'.length);

s=s.replace('v2.2 단일 고정 가이드 → 오늘의 의상·장소 → CUT별 장면 → 레이아웃 계약 → 검수 조건 순서로 한 번만 구성합니다.','v2.4 고정 이미지 가이드 → 오늘의 입력을 결합해 한 번만 구성합니다. 고정 가이드와 오늘의 가변 조건은 분리됩니다.');
s=s.replace('프롬프트를 만들면 v2.2 단일 가이드·구형 표현·섹션 순서를 자동 검수합니다.','프롬프트를 만들면 v2.4 고정 가이드 적용 여부와 오늘 입력 결합 상태를 자동 검수합니다.');

// V74 prompt builder uses the visible/read-only v2.4 guide as the single source of truth.
// This removes the old duplicated hard-coded v2.2 prompt body without touching image/editor/export paths.
const bStart=s.indexOf('function build(){');
const bEnd=s.indexOf("}q('#build').onclick=build;",bStart);
if(bStart<0||bEnd<0)throw new Error('build function target missing');
const buildFn=`function build(){
  archivePrompt(q('#prompt').value);
  if(!sceneData.length)compose();
  if(!sceneData.length)return;
  const rawExtra=q('#notes').value.trim();
  const legacyExtra=/IHIRI MINIMI HANJI SOFT WASH\\s*v1\\.3|soft brown-black/i.test(rawExtra);
  const extra=legacyExtra?'':rawExtra;
  const todayLook=q('#dailyLook').value.trim()||'Not specified — infer only from today’s scene/reference photos; never reuse a past diary outfit.';
  const todayPlace=q('#dailyPlace').value.trim()||'Not specified — follow today’s scene and any attached real-location reference only.';
  const exactText=q('#exactPlaceText').value.trim()||'NONE';
  const camera=q('#cutDirection').value.trim()||'Not specified — choose natural views while preserving spatial continuity.';
  const cuts=sceneData.map((x,i)=>'- CUT '+(i+1)+' 행동·시점·장소: '+x).join('\\n');
  const fullGuide=q('#styleGuide').value.trim();
  const marker='## [오늘의 입력 — 매일 새로 작성]';
  const fixedGuide=fullGuide.includes(marker)?fullGuide.slice(0,fullGuide.indexOf(marker)).trim():fullGuide;
  q('#prompt').value='DAYFRAME INK — V74 IMAGE PROMPT\\n\\n'+fixedGuide+
    (extra?'\\n\\n## 추가 정체성 메모 — 고정\\n'+extra:'')+
    '\\n\\n## [오늘의 입력 — 오늘]\\n\\n'+
    '- 오늘의 이야기: '+q('#diary').value.trim()+'\\n'+cuts+'\\n'+
    '- 이히리의 기본 의상 / 가방 / 신발 / 착용 상태: '+todayLook+'\\n'+
    '- 컷별 장소·소품·실내외 상태 및 반드시 보일 구조: '+todayPlace+'\\n'+
    '- 정확히 허용할 장소·의상 문구(없으면 NONE): '+exactText+'\\n'+
    '- CUT별 시선·카메라 방향: '+camera+'\\n'+
    '- 당일 실사 사진별 참고 목적: 오늘 업로드한 실사 참고 이미지는 실제 장소·물건·의상·신발·간판의 구조만 참고한다. 사진의 얼굴·조명·선명도·채도·재질은 복제하지 않는다.\\n\\n'+
    '최종 반환: 그림 검수와 실제 파일 검수를 통과한, 테두리·캡션 없는 flat 4:5 PNG 한 장.';
  const pv=q('#prompt').value;
  const ok=pv.includes('# DAYFRAME INK × IHIRI — 고정 이미지 가이드 v2.4')&&pv.includes('## [오늘의 입력 — 오늘]')&&!/IHIRI MINIMI HANJI SOFT WASH\\s*v1\\.3|soft brown-black/i.test(pv);
  q('#promptQA').textContent=ok?(legacyExtra?'✓ v2.4 고정 가이드 적용 · 저장된 구형 v1.3 추가 메모는 이번 프롬프트에서 자동 제외 · 오늘 입력 결합 정상':'✓ v2.4 고정 가이드 적용 · 오늘 입력 결합 정상 · 과거 일기 자동 상속 없음'):'⚠️ 프롬프트 검수 필요: v2.4 고정 가이드 또는 오늘 입력 결합 상태를 확인하세요.';
  saveCurrentPrompt();
}`;
s=s.slice(0,bStart)+buildFn+s.slice(bEnd+1);

s=s.replace("q('#promptQA').textContent='이전 프롬프트를 복원했습니다. 필요하면 다시 v2.2 프롬프트 만들기를 눌러 최신 가이드로 갱신하세요.'","q('#promptQA').textContent='이전 프롬프트를 복원했습니다. 필요하면 다시 v2.4 프롬프트 만들기를 눌러 최신 가이드로 갱신하세요.'");

// Regression guards: V74 is a guide/prompt-only update.
if(!s.includes('V74 STATIC BUILD'))throw new Error('V74 static marker missing');
if(!s.includes('# DAYFRAME INK × IHIRI — 고정 이미지 가이드 v2.4'))throw new Error('v2.4 guide missing');
if(!s.includes('승인된 4컷의 CUT 1 이히리 얼굴'))throw new Error('CUT1 face reference missing');
if(!s.includes('RGB (248, 247, 245)'))throw new Error('pixel contract missing');
if(!s.includes('maskOutsideCutFrames'))throw new Error('V73 4:5 clipping regression');
if(!s.includes('export the text from the exact DOM layout'))throw new Error('V72 export stabilization regression');
if(!s.includes("function line(ctx,a,b,c,d,seed,widthScale=1,strokeColor='#302e2a',baseWidth=null)"))throw new Error('V3 line regression');
if(!s.includes('function renderTopArtBase(){'))throw new Error('long Dayframe path regression');
if(s.includes("fetch('./base-v59.html")||s.includes("fetch('./v66.html"))throw new Error('runtime patch chain reintroduced');

const sa=s.indexOf('<script>'),sb=s.indexOf('</script>',sa+8);
if(sa<0||sb<0)throw new Error('script missing');
new Function(s.slice(sa+8,sb));

fs.writeFileSync('v74.html',s);
const idx='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f0e7"><title>Dayframe Ink V74</title><style>html,body{margin:0;background:#f4f0e7;color:#191816;font-family:-apple-system,BlinkMacSystemFont,"Pretendard",sans-serif}body{display:grid;place-items:center;min-height:100svh;font-size:13px}</style></head><body><span>Dayframe Ink V74 여는 중…</span><script>location.replace(\'./v74.html\'+location.search+location.hash)</script></body></html>';
fs.writeFileSync('index.html',idx);
console.log('V74 static build OK · fixed image guide v2.4 only');
