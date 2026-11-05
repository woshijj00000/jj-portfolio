const SOCIAL_IMAGES=[{"src": "JJ-portfolio-assets/assets/social-card-01.png", "label": "Builder Fee", "width": 2048, "height": 2048}, {"src": "JJ-portfolio-assets/assets/social-card-02.png", "label": "SKR", "width": 2048, "height": 2048}, {"src": "JJ-portfolio-assets/assets/social-card-03.png", "label": "商务合作", "width": 2048, "height": 2048}, {"src": "JJ-portfolio-assets/assets/social-card-04.png", "label": "NVDA", "width": 2048, "height": 2048}, {"src": "JJ-portfolio-assets/assets/social-card-05.png", "label": "Wallet Integration", "width": 2048, "height": 2048}, {"src": "JJ-portfolio-assets/assets/social-card-06.png", "label": "Cobranding", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-07.png", "label": "Perps", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-08.png", "label": "WebUSB Connection", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-09.png", "label": "Monad", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-10.png", "label": "We’re Hiring", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-11.png", "label": "New Feature", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-12.png", "label": "Coming Soon", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-13.png", "label": "Three-line Content", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-14.png", "label": "Pro 2", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-15.png", "label": "OneKey 大使", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-16.png", "label": "Security Checks", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-17.png", "label": "Top Swaps", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-18.png", "label": "OneKey", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-19.png", "label": "Bluetooth Connection", "width": 1024, "height": 1024}, {"src": "JJ-portfolio-assets/assets/social-card-20.png", "label": "OneKey × YZiLabs", "width": 1024, "height": 1024}];
const SOCIAL_CANVAS={width:950,height:782};
// Closed motion path traced through the revised 950 × 782 reference.
function socialPathData() {
  const points=[[480,176],[593,212],[699,256],[791,302],[859,379],[763,472],[687,522],[576,579],[454,607],[352,567],[251,530],[180,467],[92,389],[164,305],[268,251],[357,209]];
  let d=`M ${points[0][0]} ${points[0][1]}`;
  for(let i=0;i<points.length;i++) {
    const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length],e=points[(i+2)%points.length];
    d+=` C ${b[0]+(c[0]-a[0])/6} ${b[1]+(c[1]-a[1])/6},${c[0]-(e[0]-b[0])/6} ${c[1]-(e[1]-b[1])/6},${c[0]} ${c[1]}`;
  }
  return d+' Z';
}
function socialCase() {
  return `<section class="social-case" aria-label="社媒图" data-ready="false">
    <h2 class="sr-only">社媒图</h2>
    <span class="social-corner social-top-left">X_2026</span><span class="social-corner social-top-right">DESIGNER</span>
    <span class="social-corner social-bottom-left">SOCIAL MEDIA</span><span class="social-corner social-bottom-right">COLLECTION</span>
    <svg class="social-motion-path" viewBox="0 0 ${SOCIAL_CANVAS.width} ${SOCIAL_CANVAS.height}" preserveAspectRatio="none" aria-hidden="true"><path d="${socialPathData()}" fill="none"/></svg>
    ${SOCIAL_IMAGES.map((item,i)=>`<button type="button" class="social-card" aria-label="社媒图 ${i+1}：${escapeHtml(item.label)}" aria-expanded="false"><img src="${item.src}" width="${item.width}" height="${item.height}" alt="${escapeHtml(item.label)}" draggable="false"></button>`).join('')}
  </section>`;
}
function startSocialGallery(root) {
  const stage=root.querySelector('.social-case');
  const cards=Array.from(stage.querySelectorAll('.social-card'));
  const path=stage.querySelector('path');
  const length=path.getTotalLength();
  const samples=Array.from({length:801},(_,i)=>path.getPointAtLength(i/800*length));
  const held=new Set();
  const events=new AbortController();
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let width=stage.clientWidth,height=stage.clientHeight,phase=0,frame=0,previous=0,visible=false,disposed=false;
  function render() {
    cards.forEach((card,i)=>{
      const progress=(phase+i/cards.length)%1;
      const index=progress*800,lo=Math.floor(index),fraction=index-lo;
      const a=samples[lo],b=samples[lo+1];
      const x=(a.x+(b.x-a.x)*fraction)/SOCIAL_CANVAS.width*width;
      const y=(a.y+(b.y-a.y)*fraction)/SOCIAL_CANVAS.height*height;
      card.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      card.style.zIndex=String(20+Math.round(20*(1+Math.cos(progress*Math.PI*8))));
    });
  }
  function step(now) {
    if(disposed)return;
    const elapsed=previous?Math.min(64,now-previous):0;previous=now;
    phase=(phase+elapsed/100000)%1;
    render();frame=requestAnimationFrame(step);
  }
  function synchronize() {
    cancelAnimationFrame(frame);frame=0;previous=0;
    const running=visible&&!document.hidden&&!preference.matches&&!held.size&&!disposed;
    stage.dataset.running=String(running);
    if(running)frame=requestAnimationFrame(step);
  }
  cards.forEach(card=>{
    let pointer=false,focused=false;
    function update() {
      const active=pointer||focused;
      if(active)held.add(card);else held.delete(card);
      card.classList.toggle('is-highlighted',active);
      card.setAttribute('aria-expanded',String(active));
      synchronize();
    }
    card.addEventListener('pointerenter',()=>{pointer=true;update();},{signal:events.signal});
    card.addEventListener('pointerleave',()=>{pointer=false;update();},{signal:events.signal});
    card.addEventListener('focus',()=>{focused=true;update();},{signal:events.signal});
    card.addEventListener('blur',()=>{focused=false;update();},{signal:events.signal});
  });
  const resize=new ResizeObserver(([entry])=>{width=entry.contentRect.width;height=entry.contentRect.height;render();});
  resize.observe(stage);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;synchronize();},{root,threshold:.05});
  observer.observe(stage);
  document.addEventListener('visibilitychange',synchronize,{signal:events.signal});
  preference.addEventListener('change',synchronize,{signal:events.signal});
  render();stage.dataset.ready='true';synchronize();
  return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();events.abort();held.clear();};
}
