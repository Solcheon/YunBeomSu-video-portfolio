// node checks/content-check.cjs — 브라우저 화면 검수와 별개인 콘텐츠·경로 검사
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const context={URL,document:{querySelector:()=>({})}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'site-content.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'projects.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'app.js'),'utf8').split('function route()')[0],context);
const run=code=>vm.runInContext(code,context);
assert.equal(run('projects.length'),8);
for(const id of run('projects.map(p=>p.id)')){
 const html=run(`detail(${JSON.stringify(id)})`);
 assert(html.includes('제작 시기'));
 for(const [,target] of html.matchAll(/href="#\/work\/([^"]+)"/g))assert(run(`projects.some(p=>p.id===${JSON.stringify(target)})`));
}
assert(run("detail('entertainment')").includes('촬영 · 출연 · 편집'));
assert(run("detail('music-video')").includes('티저 편집에는 참여하지 않았습니다'));
assert(run('projects.filter(p=>p.restricted).every(p=>!media(p).includes("<video"))'));
run("selectedCategory='모션그래픽'");
const filtered=run('works()');
assert.equal((filtered.match(/class="card"/g)||[]).length,2);
assert(filtered.includes('data-filter="모션그래픽" aria-pressed="true"'));
assert(run('contact()').includes('mailto:archivebyys@gmail.com'));
assert(run('about()').includes('2026년 졸업'));
console.log('PASS: 작품 8개, 상세 경로, 역할·제작 시기, 공개 제한, 필터 유지, 연락처·학력');

// 실제 경로를 입력했을 때 기본 빈 값이 덮어쓰지 않는지 확인합니다.
const assetContext={};vm.createContext(assetContext);
vm.runInContext(fs.readFileSync(path.join(root,'projects.js'),'utf8').replace("id:'film',", "id:'film',thumbnail:'assets/film.jpg',video:'assets/film.mp4',teaser:'assets/teaser.mp4',"),assetContext);
assert.equal(vm.runInContext("projects.find(p=>p.id==='film').video",assetContext),'assets/film.mp4');
assert.equal(vm.runInContext("projects.find(p=>p.id==='film').thumbnail",assetContext),'assets/film.jpg');
assert.equal(vm.runInContext("projects.find(p=>p.id==='film').teaser",assetContext),'assets/teaser.mp4');
console.log('PASS: 썸네일·본편·티저 경로 보존');
const film=run("detail('film')");
assert(film.indexOf('티저 · 00:42')<film.indexOf('제작 시기'));
assert(film.includes('본편 · 19:12'));
const biography=run('about()');
assert(biography.indexOf('<h2>학력')<biography.indexOf('<h2>이력서'));
assert(biography.indexOf('<h2>이력서')<biography.indexOf('<h2>제작 경험'));
assert(run("leadMedia({...projects[0],video:'assets/self.mp4'})").includes('<video'));
assert(!run("leadMedia({...projects[4],video:'assets/private.mp4'})").includes('<video'));
console.log('PASS: Figma 구성 순서, 단일 영상 상단 표시, 제한 영상 차단');

assert(run("leadMedia({...projects[3],teaser:'assets/teaser.mp4'})").includes('티저 편집 미참여'));
console.log('PASS: 실제 티저 삽입 후에도 담당 범위 표시');

const featuredBefore=run('featuredProjects().map(p=>p.id).join(",")');
run('projects.reverse()');
assert.equal(run('featuredProjects().map(p=>p.id).join(",")'),featuredBefore);
run('projects.reverse()');
run('siteContent.email="test@example.com"');
assert(run('contact()').includes('mailto:test@example.com'));
run('siteContent.email="archivebyys@gmail.com"');
assert.equal(run('siteContent.certificates.length'),6);
console.log('PASS: 대표작 순서 독립, 연락처 설정 반영, 자격증 6개');

// 새 분류 추가·삭제 후에도 필터가 유효한 목록을 표시해야 합니다.
run("projects.push({...projects[0],id:'new-category-check',category:'새 분류'})");
assert(run('works()').includes('data-filter="새 분류"'));
run("selectedCategory='새 분류'");
assert.equal((run('works()').match(/class="card"/g)||[]).length,1);
run('projects.pop()');
assert.equal((run('works()').match(/class="card"/g)||[]).length,8);
assert.equal(run('selectedCategory'),'전체');

// 알려진 경로와 잘못된 주소를 실제 route()에 입력합니다.
context.location={hash:''};
context.window={scrollTo(){}};
context.document.querySelectorAll=()=>[];
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
run(appSource.slice(appSource.indexOf('function route()'),appSource.indexOf('function closeMenu()'))+';function closeMenu(){}');
for(const hash of ['#/','#/works','#/about','#/contact',...run('projects.map(p=>"#/work/"+p.id)')]){
 context.location.hash=hash;run('route()');
 assert(!run('main.innerHTML').includes('페이지를 찾을 수 없습니다.'));
}
for(const hash of ['#toString','#__proto__','#constructor','#/missing']){
 context.location.hash=hash;run('route()');
 assert(run('main.innerHTML').includes('페이지를 찾을 수 없습니다.'));
 assert(context.document.title.startsWith('페이지 없음'));
}
console.log('PASS: 새 분류 자동 반영·삭제 후 필터 복구, 12개 정상 경로·잘못된 경로 처리');

// 자료 없음 → 경로 입력 → 제거까지 사용자 업데이트 흐름을 확인합니다.
assert(run('about()').includes('프로필 사진 준비 중'));
assert(!run('about()').includes('이력서 보기 ↗'));
run("siteContent.profilePhoto='assets/profile.jpg';siteContent.resume={url:'assets/resume.pdf',cover:'assets/resume.jpg'};siteContent.proposal={url:'assets/proposal.pdf',cover:''}");
assert(run('about()').includes('src="assets/profile.jpg"'));
assert(run('about()').includes('href="assets/resume.pdf"'));
assert(!run('about()').includes('이력서를 추가할 예정입니다.'));
for(const page of ['about()','works()'])assert(run(page).includes('href="assets/proposal.pdf"'));
for(const invalid of ['javascript:alert(1)','data:text/html,test','file:///C:/resume.pdf','//example.com/file.pdf']){
 run(`siteContent.resume.url=${JSON.stringify(invalid)}`);
 assert(!run('about()').includes('이력서 보기 ↗'));
}
run("siteContent.profilePhoto='';siteContent.resume={url:'',cover:''};siteContent.proposal={url:'',cover:''}");
assert(run('about()').includes('이력서 준비 중'));
console.log('PASS: 자료 경로 반영·제거, 준비 문구 전환, 기획서 두 페이지 동기화, 잘못된 링크 차단');

run("selectedCategory='예능'");
assert.equal((run('works()').match(/class="card"/g)||[]).length,2);
assert(run("detail('quack-merchant')").includes('2025.10–11'));
assert(run("detail('quack-merchant')").includes('출연 · 편집'));
assert(!run("leadMedia({...projects.find(p=>p.id==='quack-merchant'),publicationPending:true,video:'assets/pending.mp4'})").includes('<video'));
assert(run("detail('quack-merchant')").includes('#/work/entertainment'));
console.log('PASS: 신규 예능 2개 필터·담당 범위·날짜·인접 작품 연결·공개 확인 전 재생 보류');

assert(run("detail('quack-merchant')").includes('15:21'));
assert(run("detail('quack-merchant')").includes('Premiere Pro · After Effects'));
assert(run("leadMedia({...projects.find(p=>p.id==='quack-merchant'),video:'assets/full.mp4'})").includes('<video'));

assert.equal(run("youtubeWatchUrl('https://youtu.be/abcdefghijk?si=test')"),'https://www.youtube.com/watch?v=abcdefghijk');
assert.equal(run("youtubeWatchUrl('https://youtube.com.evil.test/watch?v=abcdefghijk')"),'');
assert.equal(run("youtubeWatchUrl('javascript:alert(1)')"),'');
assert(run("videoSlot('https://www.youtube.com/watch?v=abcdefghijk','본편','assets/film.jpg')").includes('YouTube에서 영상 보기'));
assert(!run("videoSlot('https://youtu.be/abcdefghijk','본편')").includes('<video'));
console.log('PASS: YouTube 링크 새 탭 연결 및 위장 도메인 차단');

const embedded=run("videoSlot('https://youtu.be/abcdefghijk','본편')");
assert(embedded.includes('https://www.youtube-nocookie.com/embed/abcdefghijk?playsinline=1'));
assert(embedded.includes('referrerpolicy="strict-origin-when-cross-origin"'));
assert(embedded.includes('allowfullscreen'));
assert(!embedded.includes('autoplay=1'));
assert(!run("leadMedia({...projects[0],restricted:true,video:'https://youtu.be/abcdefghijk'})").includes('<iframe'));
assert(!run("videoSlot('javascript:alert(1)','본편')").includes('src="javascript:'));
console.log('PASS: 내부 플레이어·전체화면·referrer·공개 제한 유지');
