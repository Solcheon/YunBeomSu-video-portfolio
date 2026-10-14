const main=document.querySelector('main');
let selectedCategory='전체';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(href,label)=>`<a class="button" href="${esc(href)}">${esc(label)}</a>`;
const divider='<hr class="divider">';
const visual=p=>`<div class="visual">${p.thumbnail?`<img src="${esc(p.thumbnail)}" alt="${esc(p.title)} 썸네일" loading="lazy" width="1600" height="900">`:`<span>${esc(p.en)}<br>이미지 준비 중</span>`}</div>`;
const card=p=>`<a class="card" href="#/work/${p.id}">${visual(p)}<h3>${esc(p.title)}</h3><p class="meta">${esc(p.category)} · ${esc(p.role)}</p><p class="meta">${esc(p.date)}</p></a>`;
const row=(title,body)=>`<section class="row"><h2>${title}</h2><div class="stack">${body}</div></section>`;
// 로컬 자료 경로와 HTTP(S) 링크만 사용합니다. C:\ 경로나 실행 URL은 연결하지 않습니다.
function assetUrl(value) {
  const url=String(value??'').trim();
  if(!url || /[\u0000-\u0020\u007f\\]/.test(url) || url.startsWith('//') || url.startsWith('#'))return '';
  if(/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:\/\//i.test(url))return '';
  return url;
}
function profilePhoto() {
  const src=assetUrl(siteContent.profilePhoto);
  return `<div class="photo">${src
    ? `<img src="${esc(src)}" alt="윤범수 프로필 사진" width="640" height="800">`
    : '<span>프로필 사진 준비 중</span>'}</div>`;
}
function documentSlot(title,description,key) {
  const asset=siteContent[key]||{};
  const url=assetUrl(asset.url), cover=assetUrl(asset.cover);
  const readyDescription=key==='resume' ? '학력과 제작 경험을 정리한 이력서입니다.'
    : '기획 의도와 콘텐츠 구성 과정을 담은 자료입니다.';
  return `<section class="document"><div class="cover" aria-hidden="true">${cover
    ? `<img src="${esc(cover)}" alt="" loading="lazy" width="296" height="392">` : ''}</div>
    <div><h2>${esc(title)}</h2><p class="meta">${esc(url?readyDescription:description)}</p>${url
      ? `<a class="button" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} 보기 ↗<span class="sr-only"> (새 탭)</span></a>`
      : `<button disabled>${esc(title)} 준비 중</button>`}</div></section>`;
}
// 소개 정보를 HTML로 표시합니다. 입력한 텍스트는 안전하게 이스케이프합니다.
function renderEntries(entries) {
  return entries.map(item => `
    <div>
      <h3>${esc(item.title)}</h3>
      <p${item.muted ? ' class="meta"' : ''}>${esc(item.description)}</p>
    </div>
  `).join('');
}

// 목록 순서와 대표작 순서는 독립적입니다. 잘못된 ID는 표시하지 않습니다.
function featuredProjects() {
  return [...new Set(siteContent.featuredProjectIds)]
    .map(id => projects.find(project => project.id === id))
    .filter(Boolean);
}

function home(){return `<section class="hero"><div><p class="eyebrow">VIDEO & CONTENT CREATOR</p><h1>기획·촬영·편집을 아우르는<br>영상·콘텐츠 제작자<br>윤범수입니다.</h1></div><div><p>기획의 의도를 촬영과 편집으로 이어가며,<br>전하고 싶은 이야기를 영상으로 표현합니다.</p><a class="button" href="#/" data-scroll-featured>작품 살펴보기 ↗</a></div></section>${divider}<h2 class="home-work-heading" id="featured-works" tabindex="-1">주요 작업</h2><div class="grid">${featuredProjects().map(card).join('')}</div>${link('#/works','전체 작품 보기 ↗')}${divider}${row('ABOUT','<p>영상·콘텐츠 제작자 윤범수<br>대구과학대학교 방송영상제작과<br>2026년 졸업<br>기획 · 촬영 · 편집 · 모션그래픽</p>'+link('#/about','소개 더 보기 ↗'))}`;}
function projectCategories() {
  const order=['모션그래픽','단편영화','다큐멘터리','광고·리뷰','예능','뮤직비디오'];
  const present=[...new Set(projects.map(p=>p.category).filter(Boolean))];
  return ['전체',...order.filter(c=>present.includes(c)),...present.filter(c=>!order.includes(c))];
}
function works(){const cats=projectCategories();if(!cats.includes(selectedCategory))selectedCategory='전체';return `<section class="stack"><p class="eyebrow">PORTFOLIO</p><h1>작업 모음</h1><p class="muted">작품의 결과물과 직접 맡은 역할을 함께 소개합니다.</p></section><div class="filters" aria-label="작품 분류">${cats.map((c,i)=>`<button data-filter="${esc(c)}" aria-pressed="${c===selectedCategory}">${esc(c)}</button>`).join('')}</div><p class="sr-only" id="result-count" aria-live="polite">${esc(selectedCategory)} ${projects.filter(p=>selectedCategory==='전체'||p.category===selectedCategory).length}개 작품</p><div class="grid results" id="results">${projects.filter(p=>selectedCategory==='전체'||p.category===selectedCategory).map(card).join('')}</div>${divider}${documentSlot('기획서','기획 의도와 콘텐츠 구성 과정을 정리한 문서를 추가할 예정입니다.','proposal')}`;}
function about(){return `<h1>소개</h1><section class="profile">${profilePhoto()}<div class="stack"><p class="eyebrow">VIDEO & CONTENT CREATOR</p><h2>윤범수 <span class="muted">· 용사</span></h2><p>기획·촬영·편집을 아우르는 영상·콘텐츠 제작자입니다.</p><p>기획의 의도를 촬영과 편집으로 이어가며, 전하고 싶은 이야기를 영상으로 표현합니다.</p><p class="meta">2003.04.26 · 남성</p></div></section>${divider}${row('학력','<p>대구과학대학교 방송영상제작과</p><p class="meta">2026년 졸업 · 전문대학 졸업</p>')}${documentSlot('이력서','학력과 제작 경험을 정리한 이력서를 추가할 예정입니다.','resume')}${divider}${row('제작 경험','<p>기획 · 연출 · 촬영 · 편집</p><p>단편영화 감독, 다큐멘터리 편집, 예능 촬영·출연·편집, 모션그래픽 제작과 뮤직비디오 본편 1차·컷 편집 등 다양한 영상 작업을 경험했습니다.</p><p>드론 조종 및 드론 촬영 경험이 있습니다.</p>')}${row('사용 도구','<p class="meta">숙련도 · '+esc(siteContent.skillLevel)+'</p>'+renderEntries(siteContent.skills))}${divider}${row('자격증',renderEntries(siteContent.certificates))}${divider}${row('AI 활용 경험',renderEntries(siteContent.aiExperience))}${divider}${documentSlot('기획서','콘텐츠 기획 과정을 살펴볼 수 있는 문서를 추가할 예정입니다.','proposal')}${divider}${link('#/contact','함께 작업하기 ↗')}`;}
function contact() {
  const email = esc(siteContent.email);
  return `<h1 id="inquiry" tabindex="-1">문의</h1>
    ${row('CONTACT', `
      <p>편집 · 모션그래픽 · 촬영 · 기획</p>
      <p>채용 및 작업 문의는 이메일로 보내주세요.</p>
      <p><a class="email" href="mailto:${email}">${email}</a></p>
      <div class="actions">
        ${link('mailto:' + siteContent.email, '메일 보내기 ↗')}
        <button id="copy-email">이메일 복사</button>
      </div>
      <p id="copy-status" role="status"></p>
    `)}
    ${divider}
    ${row('문의 시 함께 알려주세요', '<p class="meta">선택 사항</p><p><strong>채용</strong> · 회사명, 채용 직무, 채용 안내</p><p><strong>프로젝트</strong> · 작업 내용, 영상 길이·사용처, 일정, 예산, 참고 자료</p><p>정해진 내용부터 보내주시면 됩니다.</p>')}
    ${divider}
    ${row('PORTFOLIO', '<p>작품 정보와 제작 경험을 노션에서도 확인할 수 있습니다.</p><a class="button" href="https://app.notion.com/p/3e9511525a5a80b8a1e5c59bf846711d?source=copy_link" target="_blank" rel="noopener noreferrer">노션 포트폴리오 보기 ↗<span class="sr-only"> (새 탭)</span></a>')}
    ${divider}
    ${row('CONNECT', '<div class="actions"><a class="button" href="https://www.youtube.com/@Yongsa.Archive" target="_blank" rel="noopener noreferrer">솔천 · YouTube ↗<span class="sr-only"> (새 탭)</span></a><a class="button" href="https://www.instagram.com/ys.logs_/" target="_blank" rel="noopener noreferrer">Instagram · @ys.logs_ ↗<span class="sr-only"> (새 탭)</span></a></div>')}`;
}
function youtubeWatchUrl(value){
 try {
  const u=new URL(value);
  if(u.protocol!=='https:' && u.protocol!=='http:')return '';
  const host=u.hostname.toLowerCase();
  let id='';
  if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
  else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(host)){
   id=u.pathname==='/watch'?u.searchParams.get('v'):(/^\/(embed|shorts|live)\//.test(u.pathname)?u.pathname.split('/')[2]:'');
  }
  return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?'https://www.youtube.com/watch?v='+id:'';
 }catch{return '';}
}
function videoSlot(src,title,poster=''){
 const youtube=youtubeWatchUrl(src);
 const safe=assetUrl(src);
 if(youtube)return `<section class="stack"><h2>${esc(title)}</h2><iframe class="youtube-player" src="https://www.youtube-nocookie.com/embed/${esc(new URL(youtube).searchParams.get('v'))}?playsinline=1" title="${esc(title)} · YouTube 영상" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><a class="button" href="${esc(youtube)}" target="_blank" rel="noopener noreferrer">YouTube에서 영상 보기 ↗<span class="sr-only"> (새 탭)</span></a></section>`;
 return `<section class="stack"><h2>${esc(title)}</h2>${safe?`<video controls preload="metadata" playsinline aria-label="${esc(title)}" ${poster?`poster="${esc(poster)}"`:''} src="${esc(safe)}">동영상 재생을 지원하지 않는 브라우저입니다.</video>`:'<div class="video-slot">최종 영상 준비 중</div>'}</section>`;
}
function leadMedia(p){
 if(p.publicationPending)return visual(p)+'<p class="meta">영상 등록 예정 · 외부 공개 범위 확인 예정</p>';
 if(p.restricted)return visual(p)+'<p class="meta">시안용 썸네일 · 외부 공개 범위 확인 필요</p>';
 const src=p.teaserDuration?p.teaser:p.video;
 const title=p.teaserDuration?`티저 · ${p.teaserDuration}`:`본편 · ${p.duration}`;
 return src?videoSlot(src,title,p.thumbnail)+(p.id==='music-video'?'<p class="meta">티저 편집 미참여 · 본편 1차 편집 및 컷 편집 담당</p>':''):visual(p)+`<p class="meta">${esc(title)} · 영상 연결 예정${p.id==='music-video'?' / 티저 편집 미참여':''}</p>`;
}
function media(p){if(p.publicationPending)return '<p class="meta">외부 공개 가능 범위를 확인한 뒤 영상을 반영합니다.</p>';if(p.restricted)return '<p class="meta">일부 장면·썸네일 중심으로 소개하며, 전체 영상은 이 페이지에 공개하지 않습니다. 외부 공개 범위 확인 후 허용된 자료를 반영합니다.</p>';return p.teaserDuration?videoSlot(p.video,`본편 · ${p.duration}`,p.thumbnail):'';}
function detail(id){const p=projects.find(p=>p.id===id);if(!p)return `<h1>작품을 찾을 수 없습니다.</h1>${link('#/works','작품 목록으로')}`;const i=projects.indexOf(p);return `${link('#/works','← 전체 작품')}<section class="detail-head"><p class="eyebrow">${esc(p.en)}</p><h1>${esc(p.title)}</h1><p>${esc(p.summary)}</p></section>${leadMedia(p)}<dl class="facts">${[['제작 시기',p.date],['담당 작업',p.role],['사용 프로그램',p.tools],['영상 길이',p.teaserDuration?`본편 ${p.duration} · 티저 ${p.teaserDuration}`:p.duration]].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${divider}${row('프로젝트 소개',`<p>${esc(p.summary)}</p>`)}${row('담당 역할',`<p>${esc(p.role)}</p>`)}${row('작업 포인트',`<p>${esc(p.point)}</p>`)}${p.note?row('참고사항',`<p class="muted">${esc(p.note)}</p>`):''}${media(p)}${divider}<nav class="other" aria-label="다른 작품">${i>0?link('#/work/'+projects[i-1].id,'← 이전 작품'):''}${link('#/works','전체 작품')}${i<projects.length-1?link('#/work/'+projects[i+1].id,'다음 작품 →'):''}</nav>`;}
function route() {
  const path=location.hash.slice(1)||'/';
  const pages={'/':home,'/works':works,'/about':about,'/contact':contact};
  const titles={'/':'홈','/works':'작업','/about':'소개','/contact':'문의'};
  const knownPage=Object.hasOwn(pages,path);
  const isWork=path.startsWith('/work/');
  main.innerHTML=knownPage ? pages[path]() : isWork ? detail(path.slice(6))
    : `<h1>페이지를 찾을 수 없습니다.</h1>${link('#/','홈으로')}`;
  const title=knownPage ? titles[path] : isWork
    ? projects.find(p=>p.id===path.slice(6))?.title : null;
  document.title=`${title||'페이지 없음'} | 윤범수 · 영상·콘텐츠 제작자`;
  document.querySelectorAll('#navigation a').forEach(a=>{
    if(a.hash===location.hash||(isWork&&a.hash==='#/works'))a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  closeMenu();
  window.scrollTo({top:0,behavior:'instant'});
}
function closeMenu(){document.querySelector('#navigation').classList.remove('open');document.querySelector('#menu').setAttribute('aria-expanded','false');}
document.querySelector('#menu').addEventListener('click',e=>{const open=e.currentTarget.getAttribute('aria-expanded')!=='true';document.querySelector('#navigation').classList.toggle('open',open);e.currentTarget.setAttribute('aria-expanded',String(open));if(open)document.querySelector('#navigation a').focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#navigation').classList.contains('open')){closeMenu();document.querySelector('#menu').focus();}});
function setTheme(dark){document.documentElement.dataset.theme=dark?'dark':'light';const b=document.querySelector('#theme');b.textContent=dark?'라이트':'다크';b.setAttribute('aria-pressed',String(dark));b.setAttribute('aria-label',dark?'라이트 모드로 변경':'다크 모드로 변경');try{localStorage.setItem('portfolio-theme',dark?'dark':'light');}catch{}}
let savedTheme='light';try{savedTheme=localStorage.getItem('portfolio-theme')||'light';}catch{}setTheme(savedTheme==='dark');document.querySelector('#theme').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme!=='dark'));
main.addEventListener('click',async e=>{
if(e.target.closest('[data-scroll-featured]')){
 e.preventDefault();
 const section=document.querySelector('#featured-works');
 if(section){section.focus({preventScroll:true});section.scrollIntoView({block:'start'});}
 return;
}
const filter=e.target.closest('[data-filter]');if(filter){const c=filter.dataset.filter;selectedCategory=c;main.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));const list=projects.filter(p=>c==='전체'||p.category===c);document.querySelector('#results').innerHTML=list.map(card).join('');document.querySelector('#result-count').textContent=`${c} ${list.length}개 작품`;}
if(e.target.closest('#copy-email')){const status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText(siteContent.email);status.textContent='이메일 주소를 복사했습니다.';}catch{status.textContent='자동 복사가 제한되어 있습니다. 위 이메일 주소를 직접 선택해 복사해주세요.';}}});
document.querySelector('#skip-link').addEventListener('click',e=>{e.preventDefault();main.focus();main.scrollIntoView();});document.querySelector('#footer-contact').addEventListener('click',e=>{
  const inquiry=document.querySelector('#inquiry');
  if(inquiry){
    e.preventDefault();
    inquiry.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
});
window.addEventListener('hashchange',()=>{route();main.focus({preventScroll:true});});route();

// 모바일 메뉴 상태가 넓은 화면으로 전환한 뒤 남지 않도록 합니다.
window.matchMedia('(min-width: 601px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});

// 같은 경로는 hashchange가 발생하지 않으므로 메뉴를 직접 닫습니다.
document.querySelector('#navigation').addEventListener('click',e=>{
 const a=e.target.closest('a');
 if(a && a.hash===location.hash){closeMenu();main.focus({preventScroll:true});}
});

// 키보드로 헤더를 벗어나면 펼친 메뉴가 본문을 가리지 않게 닫습니다.
document.addEventListener('focusin',e=>{if(!e.target.closest('.header'))closeMenu();});
// 잘못된 자료 경로를 연결했을 때도 깨진 이미지나 빈 플레이어로 남기지 않습니다.
main.addEventListener('error',e=>{
 const el=e.target;
 if(el.tagName==='IMG'&&el.closest('.visual, .photo, .cover')){
  const label=document.createElement('span');label.textContent='이미지를 불러오지 못했습니다.';
  el.parentElement.replaceChildren(label);
 }
 if(el.tagName==='VIDEO'){
  const message=document.createElement('p');message.className='meta';message.setAttribute('role','status');
  message.textContent='영상을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
  el.replaceWith(message);
 }
},true);
