// Compact About shares desktop content, with chapters and visible carousel copy.
(() => {
 const resume=document.querySelector('#resume');if(!resume)return;
 const el=(tag,cls,copy)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(copy)n.textContent=copy;return n};
 const text=s=>{const n=resume.querySelector(s)?.cloneNode(true);if(!n)return '';n.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));return n.textContent.trim()};
 const compact=el('section','compact-about');compact.id='about-mobile';compact.setAttribute('aria-label','Обо мне');
 const nav=el('div','compact-about__nav');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Разделы обо мне');
 const stage=el('div','compact-about__stage');
 const labels=['Кто я','Опыт и роли','Вклад и отзывы','Инструменты'];
 const panels=labels.map((label,i)=>{
  const b=el('button','compact-about__tab',label);b.type='button';b.id='about-tab-'+i;b.setAttribute('role','tab');b.setAttribute('aria-controls','about-panel-'+i);nav.append(b);
  const p=el('article','compact-about__panel');p.id='about-panel-'+i;p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',b.id);stage.append(p);return p;
 });
 const navShell=el('div','compact-about__nav-shell'),sentinel=el('span','compact-about__nav-sentinel');
 navShell.append(nav);compact.append(sentinel,navShell,stage);resume.before(compact);
 new IntersectionObserver(([entry])=>navShell.classList.toggle('is-stuck',!entry.isIntersecting&&entry.boundingClientRect.top<0),{threshold:0}).observe(sentinel);
 const intro=el('div','compact-about__intro'),portrait=el('img','compact-about__portrait');
 portrait.src='assets/about-portrait-figma.webp';portrait.alt='Иллюстрация Даши';portrait.loading='lazy';
 const copy=el('div','compact-about__copy');copy.append(el('p','eyebrow',text('.resume-kicker')),el('h2','','Коммуникационный дизайнер'),el('p','',text('.resume-body')));
 const principle=el('div','compact-about__principle');principle.append(el('p','eyebrow','МОЙ ПОДХОД'),el('h3','',text('.resume-principle__copy')));
 const portraitFrame=el('div','compact-about__portrait-frame');portraitFrame.append(portrait);copy.append(principle);intro.append(portraitFrame,copy);panels[0].append(intro);
 panels[1].append(el('h2','',text('.resume-card--experience h3')));
 const experience=el('div','compact-about__network');
 resume.querySelectorAll('.experience-period').forEach(period=>{
  const row=el('article','compact-about__experience'),identity=el('div','compact-about__identity'),body=el('div','compact-about__experience-copy');
  identity.append(el('h3','',period.querySelector('h4').textContent),el('p','compact-about__period',period.querySelector('.experience-period__identity p').textContent));
  period.querySelectorAll('.experience-period__content p').forEach(p=>body.append(el('p','',p.textContent)));
  row.append(identity,body);experience.append(row);
 });panels[1].append(experience);
 const svgNS='http://www.w3.org/2000/svg';
 const networkLines=document.createElementNS(svgNS,'svg');networkLines.classList.add('compact-about__connections');networkLines.setAttribute('aria-hidden','true');experience.prepend(networkLines);
 function drawExperience(){
  if(!experience.clientWidth)return;
  const rect=experience.getBoundingClientRect();
  networkLines.setAttribute('viewBox','0 0 '+rect.width+' '+rect.height);
  networkLines.replaceChildren();
  const point=(node,edge)=>{const r=node.getBoundingClientRect();return {x:r.left-rect.left+r.width/2,y:(edge==='top'?r.top:r.bottom)-rect.top}};
  const connect=(a,b,dashed=false)=>{
   const path=document.createElementNS(svgNS,'path'),mid=(a.y+b.y)/2;
   path.setAttribute('d','M'+a.x+' '+a.y+' C'+a.x+' '+mid+' '+b.x+' '+mid+' '+b.x+' '+b.y);
   if(dashed)path.setAttribute('stroke-dasharray','4 6');networkLines.append(path);
   for(const pt of [a,b]){const dot=document.createElementNS(svgNS,'circle');dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y);dot.setAttribute('r','2.5');networkLines.append(dot)}
  };
  const rows=[...experience.querySelectorAll('.compact-about__experience')];
  rows.forEach(row=>connect(point(row.querySelector('.compact-about__identity'),'bottom'),point(row.querySelector('.compact-about__experience-copy'),'top')));
  if(rows.length===2)connect(point(rows[0].querySelector('.compact-about__experience-copy'),'bottom'),point(rows[1].querySelector('.compact-about__identity'),'top'),true);
 }
 new ResizeObserver(drawExperience).observe(experience);
 document.fonts.ready.then(drawExperience);

 panels[2].append(el('h2','',text('.resume-card--impact h3')));
 const impacts=el('div','compact-about__examples');
 resume.querySelectorAll('.impact-grid > div').forEach(item=>{
  const row=el('article','compact-about__example'),link=el('a','compact-about__thumbnail');
  const original=item.querySelector('a');link.href=original.href;link.setAttribute('aria-label',original.getAttribute('aria-label'));
  // Existing delegated case navigation also serves these links.
  link.dataset.impactCase=original.dataset.impactCase;link.dataset.impactSection=original.dataset.impactSection;
  link.append(item.querySelector('img').cloneNode(true));
  const body=el('div'),heading=el('h3'),titleLink=link.cloneNode(false);titleLink.className='compact-about__case-title';titleLink.append(el('span','',item.querySelector('h4').textContent),el('span','compact-about__case-arrow','↗'));heading.append(titleLink);body.append(heading,el('p','',item.querySelector('p').textContent));row.append(link,body);impacts.append(row);
 });panels[2].append(impacts);
 const reviews=el('div','compact-about__reviews'),quotes=el('div','compact-about__quotes');
 resume.querySelectorAll('.review-track blockquote').forEach(q=>quotes.append(q.cloneNode(true)));
 reviews.append(quotes);panels[2].append(reviews);
 panels[3].append(el('p','eyebrow','ПРАКТИКА И ВЕКТОР'),el('h2','',text('.practice-main h3')));
 const tools=el('div','compact-about__tool-slider'),icons=el('div','compact-about__icons'),description=el('div','compact-about__tool-copy');
 description.setAttribute('aria-live','polite');
 const toolButtons=[...resume.querySelectorAll('.resume-stack button')];

 const belt=el('div','compact-about__belt');icons.append(belt);
 let toolIndex=0,physical=toolButtons.length*3,settleTimer=0;
 const count=toolButtons.length;
 for(let cycle=0;cycle<7;cycle++)toolButtons.forEach((source,i)=>{
  const b=el('button');b.type='button';b.setAttribute('aria-label',source.dataset.tool);
  b.append(source.querySelector('img').cloneNode(true));b.addEventListener('click',()=>showTool(i));belt.append(b);
 });
 const renderBelt=(animate=true)=>{
  if(!animate)[...belt.children].forEach(b=>b.style.transition='none');
  else [...belt.children].forEach(b=>b.style.removeProperty('transition'));
  belt.style.transition=animate?'transform .65s cubic-bezier(.22,.68,.16,1)':'none';
  belt.style.transform='translateX('+(-physical*76)+'px)';
  [...belt.children].forEach((b,j)=>{
   const distance=Math.abs(j-physical);
   b.style.filter='blur('+Math.min(5,distance*1.35)+'px)';
   b.style.opacity=String(Math.max(.18,1-distance*.22));
   b.style.transform='scale('+Math.max(.66,1-distance*.12)+')';
   b.setAttribute('aria-pressed',String(j===physical));
   b.tabIndex=distance<=2?0:-1;
  });
  if(!animate){belt.getBoundingClientRect();[...belt.children].forEach(b=>b.style.removeProperty('transition'))}
 };
 const rebaseBelt=()=>{const focused=belt.contains(document.activeElement);physical=count*3+toolIndex;renderBelt(false);if(focused)belt.children[physical]?.focus({preventScroll:true})};

 function showTool(i,animate=true){
  const next=(i+count)%count;
  let delta=(next-toolIndex+count)%count;if(delta>count/2)delta-=count;
  physical+=delta;toolIndex=next;
  const source=toolButtons[toolIndex];
  description.replaceChildren(el('h3','',source.dataset.tool),el('p','',source.dataset.description));
  renderBelt(animate);clearTimeout(settleTimer);
  settleTimer=setTimeout(rebaseBelt,680);
 }
 // Reserve the longest description at this width, including after fonts load.
 function sizeToolCopy(){
  const saved=toolIndex;description.style.minHeight='0px';let height=0;
  toolButtons.forEach(source=>{description.replaceChildren(el('h3','',source.dataset.tool),el('p','',source.dataset.description));height=Math.max(height,description.scrollHeight)});
  description.style.minHeight=height+'px';
  const source=toolButtons[saved];description.replaceChildren(el('h3','',source.dataset.tool),el('p','',source.dataset.description));
 }
 icons.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();showTool(toolIndex+(e.key==='ArrowRight'?1:-1));belt.children[physical]?.focus({preventScroll:true})});
 let wheelTime=0;icons.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY))return;e.preventDefault();if(Date.now()-wheelTime>300){wheelTime=Date.now();showTool(toolIndex+(e.deltaX>0?1:-1))}},{passive:false});
 tools.append(icons,description);panels[3].append(tools);
 const next=el('div','compact-about__next');next.append(el('p','eyebrow','ОСВАИВАЮ ДАЛЬШЕ'),el('h3','',text('.practice-next h4')),el('p','',text('.next-copy')));next.lastElementChild.innerHTML=resume.querySelector('.next-copy').innerHTML;panels[3].append(next);showTool(0,false);
 const swipe=(surface,move)=>{let start;surface.addEventListener('touchstart',e=>{if(e.target.closest('.compact-about__icons'))return;const t=e.touches[0];start={x:t.clientX,y:t.clientY}},{passive:true});surface.addEventListener('touchend',e=>{if(!start)return;const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.5){e.stopPropagation();move(dx<0?1:-1)}start=null},{passive:true})};
 let reviewIndex=0;
 const dots=el('div','compact-about__dots');dots.setAttribute('aria-label','Отзывы');
 const showReview=i=>{reviewIndex=(i+quotes.children.length)%quotes.children.length;[...quotes.children].forEach((q,j)=>q.hidden=j!==reviewIndex);[...dots.children].forEach((b,j)=>b.setAttribute('aria-current',String(j===reviewIndex)))};
 [...quotes.children].forEach((q,i)=>{const b=el('button');b.type='button';b.setAttribute('aria-label','Показать отзыв '+(i+1));b.addEventListener('click',()=>showReview(i));dots.append(b)});
 reviews.append(dots);showReview(0);let reviewY=null;
 reviews.addEventListener('touchstart',e=>{reviewY=e.touches[0].clientY},{passive:true});
 reviews.addEventListener('touchend',e=>{if(reviewY!==null){const dy=e.changedTouches[0].clientY-reviewY;if(Math.abs(dy)>42)showReview(reviewIndex+(dy<0?1:-1));reviewY=null}},{passive:true});
 dots.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();showReview(reviewIndex+(e.key==='ArrowDown'?1:-1));dots.children[reviewIndex].focus()});// Drag the icon belt directly; preserve vertical page scrolling.
 let drag=null,suppressClick=false;
 icons.addEventListener('pointerdown',e=>{if(e.button!==0)return;clearTimeout(settleTimer);rebaseBelt();drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,horizontal:false};});
 icons.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.horizontal&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.horizontal=true;icons.setPointerCapture(e.pointerId)}if(!drag.horizontal)return;drag.dx=dx;belt.style.transition='none';belt.style.transform='translateX('+(-physical*76+dx)+'px)';
 [...belt.children].forEach((b,j)=>{const d=Math.abs(j-physical+dx/76);b.style.transition='none';b.style.filter='blur('+Math.min(5,d*1.35)+'px)';b.style.opacity=String(Math.max(.18,1-d*.22));b.style.transform='scale('+Math.max(.66,1-d*.12)+')'})});
 const finishDrag=e=>{if(!drag)return;const d=drag;drag=null;if(d.horizontal){suppressClick=true;setTimeout(()=>suppressClick=false,0);const steps=Math.max(-3,Math.min(3,Math.round(-d.dx/76)));showTool(toolIndex+steps)}};
 icons.addEventListener('pointerup',finishDrag);icons.addEventListener('pointercancel',()=>{drag=null;renderBelt()});
 icons.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation()}},true);

 let active=0;
 const tabs=[...nav.children],reduced=matchMedia('(prefers-reduced-motion:reduce)');
 function showPanel(i,focus=false){active=(i+4)%4;panels.forEach((p,j)=>{p.hidden=j!==active;p.inert=j!==active});tabs.forEach((b,j)=>{b.classList.toggle('is-passed',j<active);b.setAttribute('aria-selected',String(j===active));b.tabIndex=j===active?0:-1});if(focus)tabs[active].focus();{const r=tabs[active].getBoundingClientRect(),n=nav.getBoundingClientRect();if(r.left<n.left+20||r.right>n.right-20)nav.scrollTo({left:nav.scrollLeft+r.left-n.left-20,behavior:reduced.matches?'instant':'smooth'})}}
 tabs.forEach((b,i)=>{b.addEventListener('click',()=>showPanel(i));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();showPanel(e.key==='Home'?0:e.key==='End'?3:active+(e.key==='ArrowRight'?1:-1),true)})});
 swipe(stage,d=>showPanel(active+d));showPanel(0);
 let measuredWidth=0;const measure=()=>{if(!compact.offsetWidth)return;sizeToolCopy()};
 new ResizeObserver(()=>{if(compact.clientWidth!==measuredWidth){measuredWidth=compact.clientWidth;measure()}}).observe(compact);
 document.fonts.ready.then(measure);measure();

 const media=matchMedia('(max-width:1100px)');
 const sync=()=>{const link=document.querySelector('.nav__links a[href="#about"],.nav__links a[href="#about-mobile"],.nav__links a[href="#resume"]');if(link)link.setAttribute('href',media.matches?'#about-mobile':'#resume')};media.addEventListener('change',sync);sync();
 document.querySelectorAll('.case-study__nav br').forEach(br=>br.after(document.createTextNode(' ')));
})();

// Keep the mortgage CTA with the copy in compact layouts, and restore desktop placement.
(()=>{
 const button=document.querySelector('.cases .case__details--edge');if(!button)return;
 const copy=button.closest('.case').querySelector('.case__copy');
 const marker=document.createComment('Desktop mortgage CTA position');button.before(marker);
 const compact=matchMedia('(max-width:1100px)');
 const sync=()=>{if(compact.matches)copy.append(button);else marker.after(button)};
 compact.addEventListener('change',sync);sync();
})();

// Settle at the chapter navigation after a deliberate scroll out of the hero.
(()=>{
 const section=document.querySelector('#about-mobile'),nav=section?.querySelector('.compact-about__nav');
 if(!nav)return;
 let timer,touching=false,settling=false;
 const settle=()=>{
  if(touching||settling||!matchMedia('(max-width:1100px)').matches||document.body.classList.contains('case-study-open'))return;
  const target=section.getBoundingClientRect().top+scrollY+parseFloat(getComputedStyle(section).paddingTop);
  const distance=target-scrollY;
  if(Math.abs(distance)>96||Math.abs(distance)<2)return;
  settling=true;scrollTo({top:target,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  setTimeout(()=>settling=false,700);
 };
 addEventListener('touchstart',()=>{touching=true;clearTimeout(timer)},{passive:true});
 addEventListener('touchend',()=>{touching=false;clearTimeout(timer);timer=setTimeout(settle,180)},{passive:true});
 addEventListener('scroll',()=>{clearTimeout(timer);if(!settling)timer=setTimeout(settle,180)},{passive:true});
})();
// Match the portrait's lower corners to its backing while retaining the left extension.
(()=>{
 const frame=document.querySelector('#about-panel-0 .compact-about__portrait-frame');if(!frame)return;
 const update=()=>{
  if(!matchMedia('(min-width:601px) and (max-width:1100px)').matches){frame.style.removeProperty('clip-path');return}
  const w=frame.clientWidth,h=frame.clientHeight,r=22,left=-90;
  if(!w||!h)return;
  frame.style.clipPath=`path("M ${left+r} 0 H ${w-r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h-r} A ${r} ${r} 0 0 1 ${w-r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h-r} H ${left+r} Q ${left} ${h-r} ${left} ${h-2*r} V ${r} Q ${left} 0 ${left+r} 0 Z")`;
 };
 new ResizeObserver(update).observe(frame);addEventListener('resize',update,{passive:true});update();
})();
