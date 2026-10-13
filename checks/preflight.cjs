// node checks/preflight.cjs — 사용자 자료 추가 후 실행하는 배포 전 구조 검사
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const errors=[],pending=[],manual=[];
const context={};vm.createContext(context);
try {
  for(const file of ['site-content.js','projects.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{timeout:1000});
} catch(error) {console.error('FAIL: 설정 파일 문법 또는 읽기 오류:',error.message);process.exit(1);}
const {projects,site}=vm.runInContext('({projects,site:siteContent})',context);
const ids=new Set();
function asset(value,label,video=false){
  if(!value){pending.push(label);return;}
  if(typeof value!=='string'){errors.push(label+': 경로는 문자열이어야 합니다.');return;}
  const url=value.trim();
  if(!url){pending.push(label);return;}
  if(/[\u0000-\u0020\u007f\\]/.test(url)||url.startsWith('//')||url.startsWith('#')){errors.push(label+': 공백·역슬래시 또는 잘못된 경로 형식');return;}
  if(/^https?:\/\//i.test(url)){
    try {
      const parsed=new URL(url);
      if(video && /(^|\.)(vimeo\.com)$/i.test(parsed.hostname))errors.push(label+': 이 플레이어에는 영상 파일 주소가 필요합니다. 동영상 페이지 링크는 별도 구현이 필요합니다.');
      else manual.push(label+': 외부 주소의 접근 권한·재생 확인 필요');
    }catch{errors.push(label+': 올바르지 않은 URL');}
    return;
  }
  if(/^[a-z][a-z0-9+.-]*:/i.test(url)||url.startsWith('/')){errors.push(label+': assets/file.ext 형태의 상대 경로를 사용하세요.');return;}
  let decoded;
  try{decoded=decodeURIComponent(url.split(/[?#]/)[0]);}catch{errors.push(label+': URL 인코딩 오류');return;}
  const resolved=path.resolve(root,decoded);
  if(!resolved.startsWith(root+path.sep)){errors.push(label+': 프로젝트 폴더 밖의 파일');return;}
  if(!fs.existsSync(resolved)||!fs.statSync(resolved).isFile())errors.push(label+': 파일 없음 — '+url);
}
if(!Array.isArray(projects)||!projects.length)errors.push('작품 목록이 비어 있거나 배열이 아닙니다.');
else for(const [index,p] of projects.entries()){
  const label=p.title||'작품 '+(index+1);
  for(const key of ['id','title','category','en','date','role','tools','duration','summary','point'])if(typeof p[key]!=='string'||!p[key].trim())errors.push(label+': '+key+' 누락');
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id||''))errors.push(label+': id는 영문 소문자·숫자·하이픈으로 지정하세요.');
  if(ids.has(p.id))errors.push(label+': id 중복 — '+p.id);ids.add(p.id);
  asset(p.thumbnail,label+' 썸네일');
  const incomplete=['date','role','tools','duration','summary','point'].filter(key=>typeof p[key]==='string'&&/확인 예정|확인 후|준비 중/.test(p[key]));
  if(incomplete.length)manual.push(label+': 미확정 정보 — '+incomplete.join(', '));
  if(p.publicationPending){manual.push(label+': 외부 공개 가능 범위 확인');if(p.video||p.teaser)errors.push(label+': 공개 범위 확인 전 영상 경로가 있습니다.');}
  if(p.restricted){if(p.video||p.teaser)errors.push(label+': 공개 제한 작품에 본편·티저 경로가 있습니다.');manual.push(label+': 썸네일·발췌 장면의 공개 범위 확인');}
  else if(!p.publicationPending) {asset(p.video,label+' 본편',true);if(p.teaserDuration)asset(p.teaser,label+' 티저',true);}
}
for(const id of site.featuredProjectIds||[])if(!ids.has(id))errors.push('존재하지 않는 대표작 ID: '+id);
if(new Set(site.featuredProjectIds||[]).size!==(site.featuredProjectIds||[]).length)errors.push('대표작 ID 중복');
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email||''))errors.push('문의 이메일 형식 확인 필요');
asset(site.profilePhoto,'프로필 사진');
for(const key of ['resume','proposal']){asset(site[key]?.url,key==='resume'?'이력서':'기획서');if(site[key]?.cover)asset(site[key].cover,key+' 표지');}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,src] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))asset(src,'기본 파일 '+src);
if(/noindex/.test(html))manual.push('검색 노출 제한(noindex) 유지 중 — 정식 공개 시 결정');
for(const line of errors)console.error('ERROR: '+line);
console.log(`구조 오류 ${errors.length}개 / 미등록 자료 ${pending.length}개 / 별도 확인 ${manual.length}개`);
if(pending.length)console.log('미등록 자료:\n- '+pending.join('\n- '));
if(manual.length)console.log('별도 확인:\n- '+manual.join('\n- '));
console.log('이 검사는 파일 존재와 설정을 확인하며 실제 화면·영상 재생·배포 접근성을 보장하지 않습니다.');
process.exitCode=errors.length?1:0;
