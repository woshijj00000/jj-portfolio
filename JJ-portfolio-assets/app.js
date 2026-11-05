const config = window.PORTFOLIO;
const dialog = document.querySelector('#detail-dialog');
const scrollArea = document.querySelector('#detail-scroll');
const worksWindow = document.querySelector('#works-window');
const worksList = worksWindow.querySelector('.works-scroll');
const worksDetail = document.querySelector('#works-detail');
const worksScrollArea = document.querySelector('#works-detail-scroll');
let worksListPosition = 0;
let selectedWorkCard = null;
let returnFocus = null;
let toastTimer;
const icon=(id)=>`<img src="JJ-portfolio-assets/assets/${id}.svg" alt="" draggable="false">`;
const menuGroups={File:[['Open works','works'],['About JJ','about'],['Contact JJ','contact']],Edit:[['Copy email','copy-email'],['Copy WeChat','copy-wechat']],View:[['Icons','icons'],['List','list']],Window:[['Desktop','desktop'],['Works','works'],['About me','about'],['Contact me','contact']],Help:[['About this portfolio','about'],['Contact JJ','contact']]};
const menu=document.querySelector('#menu');
menu.innerHTML=Object.entries(menuGroups).map(([name,items])=>`<div class="menu-group"><button aria-expanded="false" data-menu="${name}">${name}</button><div class="menu-items" hidden>${items.map(([label,act])=>`<button data-action="${act}">${label}</button>`).join('')}</div></div>`).join('');
function closeMenus(){menu.querySelectorAll('[data-menu]').forEach(b=>{b.setAttribute('aria-expanded','false');b.nextElementSibling.hidden=true;});}
document.addEventListener('click',e=>{const b=e.target.closest('[data-menu]');const was=b?.getAttribute('aria-expanded')==='true';closeMenus();if(b&&!was){b.setAttribute('aria-expanded','true');b.nextElementSibling.hidden=false;}const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;if(action==='icons'||action==='list'){worksWindow.classList.toggle('list-view',action==='list');navigate('works');}else if(action.startsWith('copy-'))copyValue(action.slice(5));else navigate(action);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();if(!dialog.open&&location.hash.startsWith('#work/'))navigate('works');}});
async function copyValue(key){try{await navigator.clipboard.writeText(config[key]);toast('已复制');}catch{toast(config[key]);}}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
let projectGridReady=false;
function ensureProjectGrid() {
 if(projectGridReady)return;
 document.querySelector('#project-grid').innerHTML=config.projects.map(p=>`<button class="project-card" data-project="${p.id}" aria-label="打开 ${escapeHtml(p.title)} 项目"><img class="art" src="${escapeHtml(p.images[0])}" width="1200" height="450" loading="lazy" decoding="async" alt="${escapeHtml(p.title)} 项目封面"><span class="project-info"><strong>${escapeHtml(p.title)}</strong><span>↗ ${p.number}</span></span>${p.category||p.label?`<span class="project-category">${escapeHtml(p.category)}<em>${escapeHtml(p.label)}</em></span>`:''}</button>`).join('');
 projectGridReady=true;
}
document.querySelector('#project-count').textContent=`${config.projects.length} projects`;

function updateClock(){document.querySelector('#clock').textContent=new Date().toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',hour12:true});}
updateClock();setInterval(updateClock,30000);
function showWindow(title,content,small=false,status='Scroll to explore ↓'){
 if(!dialog.open)returnFocus=document.activeElement;
 dialog.className=`window detail-dialog${small?' is-small':''}`;
 document.querySelector('#detail-title').textContent=title;
 document.querySelector('#detail-status').textContent=status;
 document.querySelector('#expand-detail').setAttribute('aria-label','最大化窗口');
 document.querySelector('#detail-path').textContent=small?'Portfolio / '+title:'Portfolio / Works';
 document.querySelector('#project-tree').innerHTML=small?'':config.projects.map(p=>`<button data-project="${p.id}" aria-current="${location.hash==='#work/'+p.id}">${icon('folder')}<span>${escapeHtml(p.title)}</span></button>`).join('');
 scrollArea.innerHTML=content;scrollArea.scrollTop=0;
 if(!dialog.open)dialog.showModal();
 scrollArea.scrollTop=0;
}
function showWork(title,content,status) {
 if(dialog.open)dialog.close();
 if(!worksWindow.classList.contains('has-project')) {
   worksListPosition=worksList.scrollTop;
   selectedWorkCard=document.activeElement?.closest('.project-card') || null;
 }
 worksWindow.classList.add('has-project');
 worksWindow.classList.toggle('is-ye',title==='虚拟人YE');
 worksList.hidden=true;
 worksDetail.hidden=false;
 document.querySelector('#works-back').dataset.open='works';
 document.querySelector('#works-back').setAttribute('aria-label','返回作品列表');
 document.querySelector('#works-path').textContent='Portfolio / Works / '+title;
 document.querySelector('#works-project-tree').innerHTML=config.projects.map(p=>`<button data-project="${p.id}" aria-current="${location.hash==='#work/'+p.id}">${icon('folder')}<span>${escapeHtml(p.title)}</span></button>`).join('');
 worksScrollArea.innerHTML=content;
 worksScrollArea.scrollTop=0;
 worksScrollArea.focus({preventScroll:true});
}
function showWorksList() {
 ensureProjectGrid();
 const fromProject=worksWindow.classList.contains('has-project');
 worksWindow.classList.remove('has-project','is-ye');
 worksDetail.hidden=true;
 worksList.hidden=false;
 document.querySelector('#works-back').dataset.open='desktop';
 document.querySelector('#works-back').setAttribute('aria-label','返回桌面');
 document.querySelector('#works-path').textContent='Portfolio / Works';
 if(dialog.open)dialog.close();
 if(fromProject) {
   worksList.scrollTop=worksListPosition;
   if(selectedWorkCard?.isConnected)selectedWorkCard.focus({preventScroll:true});
 }
}
let stopSummerDemo;
let stopSocialDemo;
function openProject(id){
 const aliases={'between-lines':'ip-design'};
 const p=config.projects.find(p=>p.id===(aliases[id]||id));
 if(!p){navigate('works');return;}
 if(aliases[id]){navigate(`work/${p.id}`);return;}
 if(p.id==='summer-sale') {
   showWork(p.title,summerCase());
   stopSummerDemo=startSummerDemo(worksScrollArea);
 } else if(p.id==='social-media') {
   showWork(p.title,socialCase());
   stopSocialDemo=startSocialGallery(worksScrollArea);
 } else if(p.id==='ye') {
   showWork(p.title,yeCase());
 } else {
   const images=p.detailTiles||[{src:p.detailImage,width:p.width,height:p.height}];
   showWork(p.title,`<article class="project-board-image" aria-label="${escapeHtml(p.title)}">${images.map((image,i)=>`<img src="${escapeHtml(image.src)}" width="${image.width}" height="${image.height}" loading="${i?'lazy':'eager'}" decoding="async" alt="${escapeHtml(p.title)}${images.length>1?' · '+(i+1):''}">`).join('')}</article>`);
 }
}
function openAbout() {
  const content = `<div class="about-content">
    <span class="about-eyebrow">A LITTLE BIT ABOUT ME</span>
    <h2>Hello,<br>I'm <em>${escapeHtml(config.name)}.</em></h2>
    <p>${escapeHtml(config.introduction)}</p>
    <div class="about-actions">
      <button class="about-works-button" data-open="works"><span class="about-works-label" aria-hidden="true"></span><span class="sr-only">看看我的作品</span></button>
    </div>
    <section class="about-resume" aria-label="蒋洁的简历">
      <div class="resume-photo"><img src="JJ-portfolio-assets/assets/jj-portrait.jpg" width="1536" height="1536" loading="lazy" decoding="async" alt="蒋洁"></div>
      <div class="resume-copy">
        <dl class="resume-details">
          <div><dt>姓名</dt><dd>蒋洁</dd></div>
          <div><dt>毕业院校</dt><dd class="resume-education"><span><b>2022.09 — 2025.06</b><span>中国戏曲学院</span></span><span><b>2017.09 — 2021.06</b><span>湖南工商大学</span></span></dd></div>
          <div><dt>专业</dt><dd>视觉设计与媒体艺术</dd></div>
          <div><dt>电话</dt><dd><a href="tel:18570021571">18570021571</a></dd></div>
          <div><dt>邮箱</dt><dd><a href="mailto:1477212389@qq.com">1477212389@qq.com</a></dd></div>
        </dl>
        <section class="resume-experience" aria-labelledby="resume-work-title">
          <h3 id="resume-work-title">工作经历</h3>
          <div class="resume-job">
            <b class="resume-date">2025.06 — 2026.11</b>
            <h4>OneKey-web3</h4>
            <p>负责硬件产品电商平台视觉物料、产品推广素材、Banner、营销活动页面及社交媒体传播素材设计，提升产品视觉表现力与传播效果；参与产品包装、礼品卡、会员周边及品牌衍生物料设计，涵盖从创意构思、视觉设计到印刷制作的完整落地流程等。</p>
          </div>
          <div class="resume-job">
            <b class="resume-date">2024.08 — 2025.03</b>
            <h4>百度（网盘用户体验组）实习</h4>
            <p>负责百度网盘方向的基础运营、品牌季度活动及物料延展设计，内容包括品牌KV、活动长图、banner、模版设计等</p>
          </div>
        </section>
      </div>
    </section>
  </div>`;
  showWindow('About me.txt', content, true, 'About JJ · 持续更新中');
  dialog.classList.add('is-about');
}
function openContact(){showWindow('Contact me.txt',`<div class="contact-content"><span class="about-eyebrow">GOOD THINGS START WITH A HELLO</span><h2>Let's make<br><em>something.</em></h2><p>一个新想法，一次有趣的合作，或者只是打个招呼。<br>很高兴认识你。</p><div class="contact-row"><div><label>EMAIL</label>${config.email?`<a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)} ↗</a>`:'<span class="contact-value">邮箱地址待补充</span>'}</div>${config.email?'<button class="copy-btn" data-copy="email">复制</button>':''}</div><div class="contact-row"><div><label>WECHAT / 微信</label><span class="contact-value">${escapeHtml(config.wechat)}</span></div><button class="copy-btn" data-copy="wechat">复制</button></div><p class="contact-footnote">复制微信号后，在微信中搜索添加。</p></div>`,true,'Say hello. Start something.');}
function route(){
 if(stopSocialDemo){stopSocialDemo();stopSocialDemo=undefined;}
 if (stopSummerDemo) {
   stopSummerDemo();
   stopSummerDemo = undefined;
 }
 const hash=location.hash.slice(1);
 const inWorks=hash==='works'||hash.startsWith('work/');
 worksWindow.classList.toggle('is-hidden',!inWorks);
 if(hash.startsWith('work/'))openProject(hash.slice(5));
 else if(hash==='works')showWorksList();
 else if(hash==='about')openAbout();
 else if(hash==='contact')openContact();
 else if(dialog.open)dialog.close();
}
function parentView(){return location.hash.startsWith('#work/')?'works':'desktop';}
function navigate(path){if(location.hash===`#${path}`)route();else location.hash=path;}
document.addEventListener('click',async e=>{
 const project=e.target.closest('[data-project]');if(project){navigate(`work/${project.dataset.project}`);return;}
 const opener=e.target.closest('[data-open]');if(opener){navigate(opener.dataset.open);return;}
 if(e.target.closest('[data-close]')){navigate(parentView());return;}
 const copy=e.target.closest('[data-copy]');if(copy){try{await navigator.clipboard.writeText(config[copy.dataset.copy]);toast('已复制，期待与你联系！');}catch{toast('请长按联系方式进行复制');}}
});
dialog.addEventListener('cancel',e=>{e.preventDefault();navigate(parentView());});
dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)navigate(parentView());}});
document.querySelector('#expand-detail').addEventListener('click',()=>{dialog.classList.toggle('is-full');document.querySelector('#expand-detail').setAttribute('aria-label',dialog.classList.contains('is-full')?'还原窗口':'最大化窗口');});
document.querySelector('#expand-works').addEventListener('click',e=>{worksWindow.classList.toggle('is-expanded');e.currentTarget.setAttribute('aria-label',worksWindow.classList.contains('is-expanded')?'还原作品列表':'放大作品列表');});
document.querySelector('#close-works').addEventListener('click',()=>{navigate('desktop');document.querySelector('.desktop-icons [data-open="works"]').focus();});
function toast(message){const el=document.querySelector('#toast');(dialog.open?dialog:document.body).append(el);el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2500);}
// Open the introduction during the first render; explicit routes stay unchanged.
if(!location.hash)history.replaceState(null,'','#about');
window.addEventListener('hashchange',route);
route();

// A single short sample also works when the portfolio opens from a local file.
const clickSound = document.querySelector('#click-sound');
document.addEventListener('click', event => {
  if (!event.isTrusted || event.button !== 0) return;
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}, { capture: true });
