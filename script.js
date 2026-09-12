const hero=document.querySelector('.hero'),gradientCanvas=document.querySelector('.hero__gradient-canvas'),nameArt=document.querySelector('.hero__name-art');
const aboutNavLink=document.querySelector('.nav a[href="#about"]');

if(hero&&gradientCanvas&&nameArt){
 const g=gradientCanvas.getContext('2d',{alpha:true}),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const parallaxLayer=nameArt.parentNode;
 const meshCanvas=document.createElement('canvas');meshCanvas.className='hero__mesh-canvas';meshCanvas.ariaHidden='true';parallaxLayer.insertBefore(meshCanvas,nameArt.nextSibling);
 const m=meshCanvas.getContext('2d'),texture=document.createElement('canvas'),tx=texture.getContext('2d');
 const blurMid=document.createElement('canvas'),blurTop=document.createElement('canvas');blurMid.className='hero__mesh-blur hero__mesh-blur--mid';blurTop.className='hero__mesh-blur hero__mesh-blur--top';blurMid.ariaHidden='true';blurTop.ariaHidden='true';parallaxLayer.insertBefore(blurMid,meshCanvas.nextSibling);parallaxLayer.insertBefore(blurTop,blurMid.nextSibling);const bm=blurMid.getContext('2d'),bt=blurTop.getContext('2d');
 const pointer={x:.5,y:.5,tx:.5,ty:.5,active:0,target:0};let width=1,height=1,dpr=1,ready=false,last=0,animationActive=true,animationFrame=0;
 const blobs=[
  {x:.05,y:.20,c:[255,253,220],a:.96,rx:.50,ry:.92,p:.2},{x:.40,y:.62,c:[255,245,190],a:.74,rx:.48,ry:.78,p:2.1},
  {x:.76,y:.20,c:[255,100,43],a:.82,rx:.50,ry:.76,p:4.2},{x:.91,y:.77,c:[255,151,59],a:.72,rx:.42,ry:.68,p:5.4},
  {x:.54,y:.15,c:[206,176,255],a:.23,rx:.28,ry:.48,p:3.3}
 ];
 function buildTexture(){
  const ar={width:nameArt.offsetWidth,height:nameArt.offsetHeight};if(!ar.width||!ar.height)return;texture.width=Math.ceil(ar.width);texture.height=Math.ceil(ar.height);tx.clearRect(0,0,texture.width,texture.height);tx.filter='brightness(0) invert(1)';
  const letters=[...nameArt.querySelectorAll('.letter')];ready=letters.every(i=>i.complete&&i.naturalWidth);if(!ready)return;
  letters.forEach(img=>{tx.drawImage(img,img.offsetLeft,0,img.offsetWidth,ar.height)});tx.filter='none';tx.globalCompositeOperation='source-in';tx.fillStyle='#fff';tx.fillRect(0,0,texture.width,texture.height);tx.globalCompositeOperation='destination-in';
  const fade=tx.createLinearGradient(0,0,0,ar.height);fade.addColorStop(0,'rgba(255,255,255,.15)');fade.addColorStop(.28,'rgba(255,255,255,.72)');fade.addColorStop(.58,'rgba(255,255,255,.96)');fade.addColorStop(1,'rgba(255,255,255,1)');tx.fillStyle=fade;tx.fillRect(0,0,ar.width,ar.height);tx.globalCompositeOperation='source-over';nameArt.classList.add('is-mesh-ready');
 }
 nameArt.querySelectorAll('.letter').forEach(i=>{if(!i.complete)i.addEventListener('load',buildTexture,{once:true})});
 function resize(){
  const r=hero.getBoundingClientRect();width=Math.max(1,Math.round(r.width));height=Math.max(1,Math.round(r.height));dpr=1;
  [gradientCanvas,meshCanvas,blurMid,blurTop].forEach(c=>{if(c.width!==width)c.width=width;if(c.height!==height)c.height=height});
  // Resizing clears the bitmap, even while the animation is paused.
  if(g)g.setTransform(1,0,0,1,0,0);m.setTransform(1,0,0,1,0,0);bm.setTransform(1,0,0,1,0,0);bt.setTransform(1,0,0,1,0,0);
  paintGradient(performance.now());buildTexture()
 }
 function glow(x,y,rx,ry,c,a,rot){g.save();g.translate(x,y);g.rotate(rot);g.scale(1,ry/rx);const q=g.createRadialGradient(0,0,rx*.03,0,0,rx);q.addColorStop(0,`rgba(${c},${a})`);q.addColorStop(.38,`rgba(${c},${a*.88})`);q.addColorStop(.7,`rgba(${c},${a*.34})`);q.addColorStop(1,`rgba(${c},0)`);g.fillStyle=q;g.fillRect(-rx,-rx,rx*2,rx*2);g.restore()}
 function paintGradient(t){
  if(!g||g.isContextLost?.())return;
  g.fillStyle='#fff8dc';g.fillRect(0,0,width,height);const px=pointer.x*width,py=pointer.y*height;
  blobs.forEach((b,i)=>{const bx=Math.sin(t*.00021+b.p)*width*.11,by=Math.sin(t*.00016+b.p*1.8)*height*.09,pull=pointer.active*(i%2?.075:.115),x=b.x*width+bx+(px-b.x*width)*pull,y=b.y*height+by+(py-b.y*height)*pull,swell=1+.16*Math.sin(t*.00017+i);glow(x,y,width*b.rx*swell,height*b.ry/swell,b.c,b.a,Math.sin(t*.00013+b.p)*.3);glow(width-x,y,width*b.rx*.72,height*b.ry*.78,b.c,b.a*.48,-Math.sin(t*.00012+b.p)*.24)});
  glow(width*.5+Math.sin(t*.00038)*width*.17,height*(.48+Math.cos(t*.00029)*.13),width*.34,height*.64,[255,255,235],.72,Math.sin(t*.0002)*.28);
  g.save();g.globalCompositeOperation='soft-light';
  for(let i=0;i<3;i++){const phase=i*2.18,x=width*(.5+Math.sin(t*.00031+phase)*.32),y=height*(.48+Math.cos(t*.00023+phase)*.3),pulse=1+Math.sin(t*.00019+phase)*.22;glow(x,y,width*.3*pulse,height*.48/pulse,i===1?[255,82,34]:[255,241,174],i===1?.2:.28,Math.sin(t*.00017+phase)*.48)}
  g.restore();
  glow(px,py,width*.22,height*.34,[255,239,190],.2*pointer.active,0);
 }
 function triangle(s0,s1,s2,d0,d1,d2){
  const den=s0.x*(s1.y-s2.y)+s1.x*(s2.y-s0.y)+s2.x*(s0.y-s1.y);if(!den)return;
  const a=(d0.x*(s1.y-s2.y)+d1.x*(s2.y-s0.y)+d2.x*(s0.y-s1.y))/den,b=(d0.y*(s1.y-s2.y)+d1.y*(s2.y-s0.y)+d2.y*(s0.y-s1.y))/den;
  const c=(d0.x*(s2.x-s1.x)+d1.x*(s0.x-s2.x)+d2.x*(s1.x-s0.x))/den,d=(d0.y*(s2.x-s1.x)+d1.y*(s0.x-s2.x)+d2.y*(s1.x-s0.x))/den;
  const e=(d0.x*(s1.x*s2.y-s2.x*s1.y)+d1.x*(s2.x*s0.y-s0.x*s2.y)+d2.x*(s0.x*s1.y-s1.x*s0.y))/den,f=(d0.y*(s1.x*s2.y-s2.x*s1.y)+d1.y*(s2.x*s0.y-s0.x*s2.y)+d2.y*(s0.x*s1.y-s1.x*s0.y))/den;
  m.save();m.beginPath();m.moveTo(d0.x,d0.y);m.lineTo(d1.x,d1.y);m.lineTo(d2.x,d2.y);m.closePath();m.clip();m.transform(a,b,c,d,e,f);m.drawImage(texture,0,0);m.restore();
 }
 function paintMesh(t){
  m.clearRect(0,0,width,height);if(!ready)return;const ar={width:nameArt.offsetWidth,height:nameArt.offsetHeight},ox=nameArt.offsetLeft,oy=nameArt.offsetTop,cols=20,rows=5,px=pointer.x*width-ox;
  const amp=ar.height*3.15*pointer.active,radius=ar.width*.25,points=[];
  for(let y=0;y<=rows;y++){points[y]=[];for(let x=0;x<=cols;x++){const sx=ar.width*x/cols,sy=ar.height*y/rows,env=Math.exp(-Math.pow((sx-px)/radius,2)*1.62),anchor=Math.pow(1-y/rows,.7);const bigNoise=Math.sin(x*.27+t*.00088)*.65+Math.cos(x*.14-y*.38-t*.00056)*.45;const turbulence=Math.pow(anchor,1.45);points[y][x]={x:ox+sx+env*turbulence*bigNoise*8*pointer.active,y:oy+sy-amp*env*anchor*(1+bigNoise*.105*turbulence)}}}
  m.filter='none';
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const s00={x:texture.width*x/cols,y:texture.height*y/rows},s10={x:texture.width*(x+1)/cols,y:s00.y},s01={x:s00.x,y:texture.height*(y+1)/rows},s11={x:s10.x,y:s01.y};triangle(s00,s10,s11,points[y][x],points[y][x+1],points[y+1][x+1]);triangle(s00,s11,s01,points[y][x],points[y+1][x+1],points[y+1][x])}m.filter='none';bm.clearRect(0,0,width,height);bt.clearRect(0,0,width,height);bm.drawImage(meshCanvas,0,0,width,height);bt.drawImage(meshCanvas,0,0,width,height);
 }
 function frame(t=0){animationFrame=0;if(!animationActive)return;pointer.x+=(pointer.tx-pointer.x)*.027;pointer.y+=(pointer.ty-pointer.y)*.027;pointer.active+=(pointer.target-pointer.active)*.022;if(t-last>48||!last){paintGradient(t);if(hero.getBoundingClientRect().bottom>0)paintMesh(t);last=t}if(!reduced)animationFrame=requestAnimationFrame(frame)}
 const currentAboutSection=()=>document.querySelector(matchMedia('(min-width:1101px)').matches?'.resume-desktop':'#about-mobile');
 function syncHeroActivity(){const aboutSection=currentAboutSection();const journeyBottom=aboutSection?aboutSection.offsetTop+aboutSection.offsetHeight:hero.offsetHeight,nextActive=document.visibilityState==='visible'&&scrollY<journeyBottom-innerHeight*.2;hero.toggleAttribute('data-animation-paused',!nextActive);if(nextActive===animationActive)return;animationActive=nextActive;if(!animationActive){pointer.target=0;if(animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0}}else{last=0;if(!reduced&&!animationFrame)animationFrame=requestAnimationFrame(frame)}}
 addEventListener('pointermove',e=>{if(!animationActive)return;pointer.tx=Math.min(Math.max(e.clientX/innerWidth,0),1);pointer.ty=Math.min(Math.max(e.clientY/innerHeight,0),1);pointer.target=1},{passive:true});document.addEventListener('pointerleave',()=>{pointer.target=0});addEventListener('scroll',syncHeroActivity,{passive:true});document.addEventListener('visibilitychange',syncHeroActivity);new ResizeObserver(resize).observe(hero);
 gradientCanvas.addEventListener('contextlost',e=>{e.preventDefault()});
 gradientCanvas.addEventListener('contextrestored',()=>{resize();syncHeroActivity()});
 addEventListener('pageshow',()=>{resize();syncHeroActivity()});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')paintGradient(performance.now())});
 resize();syncHeroActivity();frame();
}

document.querySelectorAll('[data-insurance-slider]').forEach(slider=>{
 const image=slider.querySelector('.insurance-visual img'),buttons=[...slider.querySelectorAll('[data-slide]')];
 if(!image)return;
 let request=0;
 const cache=new Map();
 const prepare=src=>{if(!cache.has(src)){const preload=new Image();preload.src=src;cache.set(src,preload.decode().then(()=>preload).catch(error=>{cache.delete(src);throw error}))}return cache.get(src)};
 const warm=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){buttons.forEach(b=>prepare(b.dataset.slide).catch(()=>{}));warm.disconnect()}},{rootMargin:'500px'});warm.observe(slider);
 buttons.forEach(button=>{
  button.dataset.slide=button.dataset.slide.replace('insurance-frame-','insurance-slide-');
  button.addEventListener('click',async()=>{
   const token=++request;
   slider.setAttribute('aria-busy','true');
   try{
    await prepare(button.dataset.slide);
    if(token!==request)return;
    image.src=button.dataset.slide;image.alt='Страховой мастер-креатив: '+button.getAttribute('aria-label');
    buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    button.removeAttribute('title');
   }catch{
    if(token===request)button.title='Не удалось загрузить изображение. Нажмите ещё раз.';
   }finally{if(token===request)slider.removeAttribute('aria-busy')}
  });
 });
 const advance=delta=>{const current=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');buttons[(current+delta+buttons.length)%buttons.length]?.click()};
 slider.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();advance(e.key==='ArrowRight'?1:-1)});
 let touch=null;slider.addEventListener('touchstart',e=>{touch=e.touches[0]},{passive:true});slider.addEventListener('touchend',e=>{if(!touch)return;const end=e.changedTouches[0],dx=end.clientX-touch.clientX,dy=end.clientY-touch.clientY;touch=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.4)advance(dx<0?1:-1)},{passive:true});
});

document.querySelectorAll('[data-process-slider]').forEach(slider=>{
 const images=[...slider.querySelectorAll('.junior-process__stage img')],range=slider.querySelector('input[type="range"]'),buttons=[...slider.querySelectorAll('[data-stage]')];
 if(!range)return;
 const dots=[];buttons.slice(0,-1).forEach((button,index)=>{const group=document.createElement('span');group.className='junior-step-dots';group.setAttribute('aria-hidden','true');for(let n=1;n<4;n++){const dot=document.createElement('i');dot.dataset.progress=String(index+n/4);group.append(dot);dots.push(dot)}button.after(group)});
 const update=()=>{const value=Number(range.value);images.forEach((image,i)=>image.style.opacity=String(Math.max(0,1-Math.abs(value-i))));buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(Math.round(value)===i)));dots.forEach(dot=>dot.classList.toggle('is-passed',Number(dot.dataset.progress)<=value));range.setAttribute('aria-valuetext',['Сборка','Свет и детали','Финал'][Math.round(value)])};
 range.addEventListener('input',update);
 const stops=slider.querySelector('.junior-refinement-stops');
 let drag=null,suppressClick=false;
 const scrub=e=>{const first=buttons[0].getBoundingClientRect(),last=buttons[buttons.length-1].getBoundingClientRect(),start=first.left+first.width/2,end=last.left+last.width/2;range.value=String(Math.max(0,Math.min(2,2*(e.clientX-start)/Math.max(1,end-start))));update()};
 buttons.forEach(button=>button.addEventListener('click',e=>{if(e.detail&&suppressClick){e.preventDefault();return}range.value=button.dataset.stage;update()}));
 stops.addEventListener('dragstart',e=>e.preventDefault());
 stops.addEventListener('selectstart',e=>e.preventDefault());
 stops.addEventListener('pointerdown',e=>{
   if(e.button!==0||drag)return;
   e.preventDefault();suppressClick=false;
   drag={id:e.pointerId,x:e.clientX,moved:false,button:e.target.closest('[data-stage]')};
   stops.setPointerCapture(e.pointerId);slider.classList.add('is-scrubbing');
   if(!drag.button)scrub(e);
 });
 stops.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();drag.moved=drag.moved||Math.abs(e.clientX-drag.x)>3;if(drag.moved)scrub(e)});
 const finish=(e,cancelled=false)=>{
   if(!drag||drag.id!==e.pointerId)return;
   if(!cancelled){if(drag.moved||!drag.button)scrub(e);else{range.value=drag.button.dataset.stage;update()}}
   suppressClick=true;drag=null;slider.classList.remove('is-scrubbing');
   if(stops.hasPointerCapture(e.pointerId))stops.releasePointerCapture(e.pointerId);
 };
 stops.addEventListener('pointerup',e=>finish(e));stops.addEventListener('pointercancel',e=>finish(e,true));stops.addEventListener('lostpointercapture',e=>finish(e,true));update();
});

document.querySelectorAll('.junior-nodeboard').forEach(board=>{
 // Stable layout slots let the frame expand without scaling its border or shifting neighbours.
 board.querySelectorAll('button[data-junior-node]').forEach(node=>{
   const slot=document.createElement('div');slot.className='junior-media-slot';slot.dataset.slot=node.dataset.juniorNode;
   node.before(slot);slot.append(node);
   if(['ref2','ref3'].includes(node.dataset.juniorNode))node.classList.add('has-image-background');
 });
 const sizeReveals=()=>{const bounds=board.getBoundingClientRect();if(!bounds.width)return;board.querySelectorAll('.junior-media-slot').forEach(slot=>{
   const r=slot.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
   const desired=slot.dataset.slot.startsWith('ref')?2.4:1.9;
   const clearance=slot.dataset.slot==='case'?36:24;
   const factor=Math.max(1,Math.min(desired,2*Math.min(cx-bounds.left-clearance,bounds.right-cx-clearance)/r.width,2*Math.max(0,cy-bounds.top-clearance)/r.height));
   slot.style.setProperty('--expanded-width',`${r.width*factor}px`);slot.style.setProperty('--expanded-height',`${r.height*factor}px`);
 })};
 new ResizeObserver(sizeReveals).observe(board);
 const canvas=board.querySelector('canvas'),ctx=canvas.getContext('2d');
 const edges=[['ref1','generation'],['ref2','blender'],['ref3','blender'],['generation','case'],['blender','scene'],['case','merged'],['scene','merged'],['merged','shading']];
const draw=()=>{const rect=board.getBoundingClientRect();if(!rect.width)return;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=rect.width*ratio;canvas.height=(rect.height+60)*ratio;canvas.style.height=`${rect.height+60}px`;ctx.scale(ratio,ratio);ctx.strokeStyle=getComputedStyle(board).getPropertyValue('--node-wire').trim()||'#b3a16b';ctx.lineWidth=1.4;edges.forEach(([a,b])=>{const from=board.querySelector(`[data-junior-node="${a}"]`).getBoundingClientRect(),to=board.querySelector(`[data-junior-node="${b}"]`).getBoundingClientRect(),x1=from.left+from.width/2-rect.left,y1=from.bottom-rect.top,x2=to.left+to.width/2-rect.left,y2=to.top-rect.top,dy=Math.max(20,(y2-y1)*.52);ctx.beginPath();ctx.moveTo(x1,y1);ctx.bezierCurveTo(x1,y1+dy,x2,y2-dy,x2,y2);ctx.stroke();ctx.save();ctx.fillStyle=ctx.strokeStyle;ctx.strokeStyle='#fff9eb';ctx.lineWidth=2;[[x1,y1],[x2,y2]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();ctx.stroke()});ctx.restore()})};
 new ResizeObserver(draw).observe(board);board.querySelectorAll('img').forEach(img=>img.addEventListener('load',draw));
 board.querySelectorAll('[data-junior-node]').forEach(node=>{
   let drag=null,offset={x:0,y:0};
   node.addEventListener('dragstart',e=>e.preventDefault());
   node.addEventListener('pointerdown',e=>{if(e.button!==0||matchMedia('(max-width:1100px)').matches)return;drag={x:e.clientX,y:e.clientY,ox:offset.x,oy:offset.y};node.setPointerCapture(e.pointerId);node.classList.add('is-dragging');e.preventDefault()});
   node.addEventListener('pointermove',e=>{if(!drag)return;offset.x=Math.max(-35,Math.min(35,drag.ox+e.clientX-drag.x));offset.y=Math.max(-35,Math.min(35,drag.oy+e.clientY-drag.y));node.style.translate=`${offset.x}px ${offset.y}px`;draw()});
   const end=()=>{drag=null;node.classList.remove('is-dragging')};node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);node.addEventListener('lostpointercapture',end);
   let motionFrame=0;
   const followOutline=()=>{cancelAnimationFrame(motionFrame);const until=performance.now()+600;const frame=()=>{draw();if(performance.now()<until)motionFrame=requestAnimationFrame(frame)};motionFrame=requestAnimationFrame(frame)};
   node.addEventListener('pointerenter',followOutline);node.addEventListener('pointerleave',followOutline);node.addEventListener('focus',followOutline);node.addEventListener('blur',followOutline);
 });
});


const caseControllers = new Map();
const caseMotionReduced = matchMedia('(prefers-reduced-motion: reduce)');
const routeToCase = id => {
 if(location.hash === '#'+id) return;
 history.pushState({...history.state,portfolioCase:true},'', '#'+id);
};
const syncCaseRoute = () => {
 const selected=caseControllers.get(location.hash.slice(1));
 caseControllers.forEach(controller=>{if(controller!==selected&&controller.isOpen())controller.close(!selected)});
 if(selected&&!selected.isOpen())selected.open(false);
};
const initCaseStudy=(caseSelector,triggerSelector)=>{const creditCase=document.querySelector(caseSelector);
const creditCaseTrigger=document.querySelector(triggerSelector);
if(creditCase&&creditCaseTrigger){
 const creditCaseScroll=creditCase.querySelector('.case-study__scroll'),closeButtons=[...creditCase.querySelectorAll('.case-study__close')],navLinks=[...creditCase.querySelectorAll('.case-study__nav button')],trackedSections=[...creditCase.querySelectorAll('.case-study__section.case-study__tracked')],heroMedia=creditCase.querySelector('.case-study__hero-media'),heroVideo=heroMedia?.querySelector('video'),motionFrame=creditCase.querySelector('.case-motion'),motionVideos=[...creditCase.querySelectorAll('.case-motion__video')],motionButtons=[...creditCase.querySelectorAll('.case-motion__controls button')],caseNav=creditCase.querySelector('.case-study__nav'),process=creditCase.querySelector('.case-process'),processSvg=creditCase.querySelector('.case-process__network'),processNodes=[...creditCase.querySelectorAll('.process-card,.process-chip')],gallery=creditCase.querySelector('.case-gallery'),galleryItems=[...creditCase.querySelectorAll('.case-gallery__item')];
 let closeTimer=0,caseIsOpen=false;
 const floatingClose=closeButtons[0];
 if(floatingClose){floatingClose.classList.add('case-study__close--floating');creditCase.append(floatingClose)}
 const sectionScrollTop=section=>section.getBoundingClientRect().top-creditCaseScroll.getBoundingClientRect().top+creditCaseScroll.scrollTop;
 const showMotion=index=>{const next=(index+motionVideos.length)%motionVideos.length;motionFrame?.setAttribute('data-motion-slide',String(next));motionVideos.forEach((video,i)=>{video.classList.toggle('is-active',i===next);video.inert=i!==next;video.setAttribute('aria-hidden',String(i!==next));if(i===next&&!creditCase.hidden)video.play().catch(()=>{});else video.pause()});motionButtons.forEach((button,i)=>{button.classList.toggle('is-active',i===next);if(i===next)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current')})};
 let heroPlaying=false,heroReplayReady=true,heroExited=true;
 const playHero=()=>{if(!heroVideo||!caseIsOpen||caseMotionReduced.matches||heroPlaying||!heroReplayReady)return;heroPlaying=true;heroReplayReady=false;heroExited=false;heroVideo.currentTime=0;heroVideo.play().catch(()=>{heroPlaying=false;heroReplayReady=true})};
 heroMedia?.addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches)playHero()});
 heroMedia?.addEventListener('pointerleave',()=>{heroExited=true;if(!heroPlaying)heroReplayReady=true});
 heroVideo?.addEventListener('ended',()=>{heroPlaying=false;heroReplayReady=heroExited||!heroMedia.matches(':hover')});
 const openCreditCase=(updateRoute=true)=>{
  if(updateRoute)routeToCase(creditCase.id);
  clearTimeout(closeTimer);caseIsOpen=true;creditCase.hidden=false;
  document.querySelector('main').inert=true;
  document.body.classList.add('case-study-open');creditCaseTrigger.setAttribute('aria-expanded','true');
  creditCaseScroll.scrollTop=0;heroPlaying=false;heroReplayReady=true;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(!caseIsOpen)return;
   creditCase.classList.add('is-open');closeButtons[0]?.focus({preventScroll:true});
   if(matchMedia('(hover:hover) and (pointer:fine)').matches)playHero();showMotion(Number(motionFrame?.dataset.motionSlide||0));layoutProcess();syncCaseNav();
  }));
 };
 const closeCreditCase=(restoreFocus=true)=>{
  caseIsOpen=false;creditCase.classList.remove('is-open');document.body.classList.remove('case-study-open');
  document.querySelector('main').inert=false;
  creditCaseTrigger.setAttribute('aria-expanded','false');
  creditCase.querySelectorAll('video').forEach(video=>video.pause());heroPlaying=false;heroReplayReady=true;
  clearTimeout(closeTimer);
  closeTimer=setTimeout(()=>{creditCase.hidden=true;if(restoreFocus)creditCaseTrigger.focus({preventScroll:true})},caseMotionReduced.matches?0:420);
 };
 const requestClose=()=>{
  closeCreditCase();
  if(history.state?.portfolioCase)history.back();
  else {history.replaceState(history.state,'','#work');document.querySelector('#work')?.scrollIntoView({behavior:'instant'});}
 };
 caseControllers.set(creditCase.id,{open:openCreditCase,close:closeCreditCase,isOpen:()=>caseIsOpen});
 creditCase.querySelectorAll('video').forEach(video=>{video.controls=false;video.removeAttribute('controls');video.loop=video!==heroVideo;video.muted=true;video.playsInline=true;if(!video.getAttribute('aria-label'))video.setAttribute('aria-label','Анимация проекта');});
 creditCaseTrigger.addEventListener('click',openCreditCase);
 const caseTile=creditCaseTrigger.closest('.case');
 caseTile?.addEventListener('click',event=>{
   // Keep the existing button as the keyboard entry point, without opening twice.
   if(event.target.closest('button,a,input,select,textarea,[contenteditable="true"]'))return;
   if(window.getSelection()?.toString().trim())return;
   openCreditCase();
 });
 closeButtons.forEach(button=>button.addEventListener('click',requestClose));
 navLinks.forEach(link=>link.addEventListener('click',()=>{const target=creditCase.querySelector(`#${link.dataset.target}`);if(!target)return;creditCaseScroll.scrollTo({top:sectionScrollTop(target)-(matchMedia('(max-width:1100px)').matches?128:24),behavior:'instant'});syncCaseNav()}));
 motionButtons.forEach((button,index)=>button.addEventListener('click',()=>showMotion(index)));
 const caseNavDots=[];for(let i=1;i<16;i++){if(i%5===0||i===14)continue;const dot=document.createElement('span');dot.className='case-study__nav-dot';dot.dataset.progress=String(i/15);dot.style.top=`${(i/15*100).toFixed(3)}%`;caseNav?.appendChild(dot);caseNavDots.push(dot)}
 const syncCaseNav=()=>{if(!trackedSections.length)return;const marker=creditCaseScroll.scrollTop+(matchMedia('(max-width:1100px)').matches?144:96),positions=trackedSections.map(sectionScrollTop);let activeIndex=0;positions.forEach((top,index)=>{if(top<=marker)activeIndex=index});const current=positions[activeIndex],next=positions[activeIndex+1],local=next!==undefined?Math.min(Math.max((marker-current)/(next-current),0),1):1,progress=trackedSections.length>1?(activeIndex+local)/(trackedSections.length-1):0;caseNav?.style.setProperty('--case-nav-progress',progress.toFixed(4));navLinks.forEach((link,index)=>{link.classList.toggle('is-active',index===activeIndex);link.classList.toggle('is-passed',index<activeIndex)});caseNavDots.forEach(dot=>dot.classList.toggle('is-passed',Number(dot.dataset.progress)<=progress+.001))};
 creditCaseScroll.addEventListener('scroll',syncCaseNav,{passive:true});
 const processNode=name=>creditCase.querySelector(`[data-node="${name}"]`);
 const drawProcess=()=>{if(!process||!processSvg)return;const width=process.clientWidth,height=process.clientHeight,processRect=process.getBoundingClientRect();processSvg.setAttribute('viewBox',`0 0 ${width} ${height}`);processSvg.replaceChildren();const point=(node,side)=>{const rect=node.getBoundingClientRect(),left=rect.left-processRect.left,top=rect.top-processRect.top;return{x:left+(side==='right'?rect.width:side==='center'||side==='top'||side==='bottom'?rect.width/2:0),y:top+(side==='top'?0:side==='bottom'?rect.height:rect.height/2)}};const addPath=d=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);processSvg.appendChild(path);[0,path.getTotalLength()].forEach(distance=>{const point=path.getPointAtLength(distance),dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('class','node-port');dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);dot.setAttribute('r','3');processSvg.appendChild(dot)})};const connect=(fromName,toName)=>{const from=processNode(fromName),to=processNode(toName);if(!from||!to)return;if(matchMedia('(max-width:1100px)').matches){const a=point(from,'bottom'),b=point(to,'top'),m=(a.y+b.y)/2;addPath(`M ${a.x} ${a.y} C ${a.x} ${m}, ${b.x} ${m}, ${b.x} ${b.y}`);return}const a=point(from,'right'),b=point(to,'left'),span=Math.max(54,Math.abs(b.x-a.x)*.52);addPath(`M ${a.x} ${a.y} C ${a.x+span} ${a.y}, ${b.x-span} ${b.y}, ${b.x} ${b.y}`)};const connectToTop=(fromName,toName)=>{const from=processNode(fromName),to=processNode(toName);if(!from||!to)return;if(matchMedia('(max-width:1100px)').matches){const a=point(from,'bottom'),b=point(to,'top'),m=(a.y+b.y)/2;addPath(`M ${a.x} ${a.y} C ${a.x} ${m}, ${b.x} ${m}, ${b.x} ${b.y}`);return}const a=point(from,'right'),b=point(to,'top'),horizontal=Math.max(36,Math.abs(b.x-a.x)*.38),vertical=Math.max(40,Math.abs(b.y-a.y)*.42);addPath(`M ${a.x} ${a.y} C ${a.x+horizontal} ${a.y}, ${b.x} ${b.y-vertical}, ${b.x} ${b.y}`)};connect('audit','composition');connect('limits','composition');connect('composition','system');connect('key','system');connectToTop('system','implementation');connectToTop('motion','implementation');const implementation=processNode('implementation'),production=processNode('production');if(implementation&&production){const a=point(implementation,'bottom'),b=point(production,'top'),span=Math.max(42,Math.abs(b.y-a.y)*.55);addPath(`M ${a.x} ${a.y} C ${a.x} ${a.y+span}, ${b.x} ${b.y-span}, ${b.x} ${b.y}`)}};
 const layoutProcess=()=>{if(!process)return;const width=process.clientWidth,set=(name,x,y)=>{const node=processNode(name);if(!node)return;node.style.left=`${Math.max(0,x)}px`;node.style.top=`${Math.max(0,y)}px`};if(width>=850){process.style.height='700px';set('audit',18,92);set('limits',72,326);set('composition',width*.31,414);set('key',width*.35,112);set('system',width*.61,74);set('motion',width*.58,352);set('implementation',width-242,508)}else if(width>=600){process.style.height='900px';set('audit',18,88);set('limits',width-172,92);set('composition',(width-210)/2,304);set('key',24,498);set('system',width-232,500);set('motion',28,706);set('implementation',width-232,716)}else{process.style.height='1080px';set('audit',18,68);set('limits',width-168,214);set('composition',(width-210)/2,348);set('key',18,524);set('system',width-232,636);set('motion',18,812);set('implementation',width-232,914)};requestAnimationFrame(drawProcess)};
 processNodes.forEach(node=>{let drag=null;node.addEventListener('pointerdown',event=>{if(matchMedia('(max-width:1100px)').matches)return;drag={x:event.clientX,y:event.clientY,left:node.offsetLeft,top:node.offsetTop};node.setPointerCapture(event.pointerId);node.style.zIndex='5'});node.addEventListener('pointermove',event=>{if(!drag||!process)return;const left=Math.max(0,Math.min(process.clientWidth-node.offsetWidth,drag.left+event.clientX-drag.x)),top=Math.max(0,Math.min(process.clientHeight-node.offsetHeight,drag.top+event.clientY-drag.y));node.style.left=`${left}px`;node.style.top=`${top}px`;drawProcess()});const end=()=>{drag=null;node.style.zIndex='2';drawProcess()};node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end)});
 if(process)new ResizeObserver(layoutProcess).observe(process);
 document.addEventListener('keydown',event=>{
  if(!creditCase.classList.contains('is-open'))return;
  if(event.key==='Escape'){event.preventDefault();requestClose();return}
  if(event.key==='Tab'){
   const items=[...creditCase.querySelectorAll('a[href],button:not([disabled]),input,video[controls],[tabindex="0"]')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
   const first=items[0],last=items[items.length-1];
   if(!first){event.preventDefault();creditCase.focus();return}
   if(event.shiftKey&&(document.activeElement===first||!creditCase.contains(document.activeElement))){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&(document.activeElement===last||!creditCase.contains(document.activeElement))){event.preventDefault();first.focus()}
  }
 });
}}
initCaseStudy('#credit-products-case','.cases .case:nth-of-type(1) .case__details');
initCaseStudy('#real-estate-case','.cases .case:nth-of-type(2) .case__details');
initCaseStudy('#special-projects-case','.cases .case:nth-of-type(3) .case__details');
addEventListener('popstate',syncCaseRoute);
addEventListener('hashchange',syncCaseRoute);
requestAnimationFrame(syncCaseRoute);
document.querySelectorAll('[data-impact-case]').forEach(link=>{
 link.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const controller=caseControllers.get(link.dataset.impactCase);if(!controller)return;
  event.preventDefault();controller.open();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(!controller.isOpen())return;
   const panel=document.getElementById(link.dataset.impactCase);
   const section=link.dataset.impactSection;
   if(section)panel.querySelector(`[data-target="${section}"]`)?.click();
  }));
 });
});

caseMotionReduced.addEventListener('change',()=>{if(caseMotionReduced.matches)document.querySelectorAll('main video').forEach(video=>video.pause())});

document.querySelectorAll('[data-before-after]').forEach(stage=>{
 const range=stage.querySelector('input[type="range"]');
 if(!range)return;
 let position=Number(range.value),magnet=0;
 let displayed=position,revealFrame=0;
 const render=()=>{
  if(revealFrame)return;
  const tick=()=>{const target=position+magnet/Math.max(stage.clientWidth,1)*100;displayed=matchMedia('(prefers-reduced-motion:reduce)').matches?target:displayed+(target-displayed)*.24;stage.style.setProperty('--reveal',`${displayed}%`);if(Math.abs(target-displayed)>.015)revealFrame=requestAnimationFrame(tick);else{stage.style.setProperty('--reveal',`${target}%`);revealFrame=0}};
  revealFrame=requestAnimationFrame(tick);
 };
 const updatePosition=clientX=>{
  const rect=stage.getBoundingClientRect();
  position=Math.min(100,Math.max(0,((clientX-rect.left)/rect.width)*100));
  range.value=String(position);render();
 };
 const updateMagnet=clientX=>{
  const rect=stage.getBoundingClientRect(),divider=rect.left+(position/100)*rect.width,distance=clientX-divider;
  magnet=Math.abs(distance)<150?Math.max(-20,Math.min(20,distance*.18)):0;render();
 };
 stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;if(event.pointerType==='mouse')event.preventDefault();range.focus({preventScroll:true});magnet=0;stage.setPointerCapture(event.pointerId);updatePosition(event.clientX)});
 stage.addEventListener('pointermove',event=>stage.hasPointerCapture(event.pointerId)?updatePosition(event.clientX):updateMagnet(event.clientX));
 stage.addEventListener('pointerup',event=>{if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId)});
 stage.addEventListener('pointercancel',event=>{if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);magnet=0;render()});
 stage.addEventListener('pointerleave',()=>{magnet=0;render()});
 range.addEventListener('input',()=>{position=Number(range.value);magnet=0;render()});
 render();
});

// Use the same drawn arrow as Details instead of font-dependent arrow glyphs.
document.querySelectorAll('a,button').forEach(control=>{
 const walker=document.createTreeWalker(control,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())if(/[↗←→]/.test(walker.currentNode.textContent))nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  const fragment=document.createDocumentFragment();
  node.textContent.split(/([↗←→])/).forEach(part=>{
   if(!/^[↗←→]$/.test(part)){fragment.append(document.createTextNode(part));return}
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS('http://www.w3.org/2000/svg','path');
   svg.setAttribute('class','portfolio-arrow');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
   path.setAttribute('d','M6 18 18 6M9 6h9v9');
   if(part!=='↗')path.setAttribute('transform',`rotate(${part==='←'?-135:45} 12 12)`);
   svg.append(path);fragment.append(svg);
  });
  node.replaceWith(fragment);
 });
});

const layeredHero=document.querySelector('.hero');
if(layeredHero){
 let heroScrollFrame=0;
 const currentJourneyEnd=()=>document.querySelector(matchMedia('(min-width:1101px)').matches?'.resume-desktop':'#about-mobile');
 const updateHeroExit=()=>{heroScrollFrame=0;const journeyEnd=currentJourneyEnd();const distance=Math.max(layeredHero.offsetHeight*.72,1),progress=Math.min(Math.max(window.scrollY/distance,0),1);layeredHero.style.setProperty('--hero-exit',progress.toFixed(4));if(scrollY>layeredHero.offsetHeight*.18)document.body.classList.add('has-left-hero');else if(scrollY<=2)document.body.classList.remove('has-left-hero');if(journeyEnd){const end=journeyEnd.offsetTop+journeyEnd.offsetHeight-innerHeight,isAbout=scrollY>=journeyEnd.offsetTop&&scrollY<end;document.body.classList.toggle('journey-frame-dim',isAbout);document.body.classList.toggle('journey-frame-off',scrollY>=end)}};
 const workSection=document.querySelector('#work');
 const updateGradientBoundary=()=>{
  if(!gradientCanvas||!workSection)return;
  const visibleHeight=Math.max(0,Math.min(innerHeight,workSection.getBoundingClientRect().top));
  gradientCanvas.style.clipPath=`inset(0 0 ${Math.max(0,gradientCanvas.getBoundingClientRect().height-visibleHeight)}px 0)`;
  gradientCanvas.style.visibility=visibleHeight>0?'visible':'hidden';
 };
 const requestHeroExit=()=>{if(!heroScrollFrame)heroScrollFrame=requestAnimationFrame(()=>{updateHeroExit();updateGradientBoundary()})};
 updateGradientBoundary();
 window.visualViewport?.addEventListener('resize',requestHeroExit,{passive:true});
 addEventListener('scroll',requestHeroExit,{passive:true});addEventListener('resize',requestHeroExit,{passive:true});updateHeroExit();
}

const caseVideos=[...document.querySelectorAll('.case__video')];
if(caseVideos.length){
 caseVideos.forEach(video=>{
  const card=video.closest('.case');if(!card)return;
  const fadeVideo=null;
  const media=video.parentElement,canvas=document.createElement('canvas');
  canvas.className='case__composited-video';canvas.setAttribute('aria-hidden','true');media.append(canvas);
  const ctx=canvas.getContext('2d');
  const paintVideo=()=>{
   if(video.readyState<2||!video.videoWidth)return;
   const m=media.getBoundingClientRect(),v=video.getBoundingClientRect(),c=card.getBoundingClientRect();
   if(!m.width||!m.height)return;
   // Expand the canvas, not the video: retain its exact scale and position.
   const left=Math.floor(Math.min(0,v.left-m.left)),top=Math.floor(Math.min(0,v.top-m.top));
   const paintWidth=Math.ceil(Math.max(m.width,v.right-m.left)-left);
   const paintHeight=Math.ceil(Math.max(m.height,v.bottom-m.top)-top);
   const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(paintWidth*dpr),h=Math.round(paintHeight*dpr);
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
   canvas.style.left=left+'px';canvas.style.top=top+'px';canvas.style.right='auto';canvas.style.bottom='auto';
   canvas.style.width=paintWidth+'px';canvas.style.height=paintHeight+'px';
   ctx.setTransform(dpr,0,0,dpr,-left*dpr,-top*dpr);ctx.clearRect(left,top,paintWidth,paintHeight);
   const frame=window.portfolioVideoFrame?.(video)||video;
   const frameWidth=frame.videoWidth||frame.width,frameHeight=frame.videoHeight||frame.height;
   const fit=Math.min(v.width/frameWidth,v.height/frameHeight),vw=frameWidth*fit,vh=frameHeight*fit;
   ctx.drawImage(frame,v.left-m.left+(v.width-vw)/2,v.top-m.top+(v.height-vh)/2,vw,vh);
   if(!card.classList.contains('case--shared-fade')&&!matchMedia('(max-width:1100px)').matches){
   const style=getComputedStyle(card),start=parseFloat(style.getPropertyValue('--case-white-start'))/100,end=parseFloat(style.getPropertyValue('--case-white-end'))/100;
   const fade=ctx.createLinearGradient(0,c.top-m.top+c.height*start,0,c.top-m.top+c.height*end);
   fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(.5,'rgba(255,255,255,.65)');fade.addColorStop(.8,'rgba(255,255,255,.95)');fade.addColorStop(1,'#fff');
   ctx.globalCompositeOperation='source-atop';ctx.fillStyle=fade;ctx.fillRect(left,top,paintWidth,paintHeight);ctx.globalCompositeOperation='source-over';
   }
   media.classList.add('is-composited');
  };
  if(video.requestVideoFrameCallback){const nextFrame=()=>{paintVideo();video.requestVideoFrameCallback(nextFrame)};video.requestVideoFrameCallback(nextFrame)}
  else{let frame;const tick=()=>{paintVideo();if(!video.paused&&!video.ended)frame=requestAnimationFrame(tick)};video.addEventListener('play',()=>{cancelAnimationFrame(frame);tick()})}
  ['loadeddata','seeked','ended'].forEach(event=>video.addEventListener(event,paintVideo));
  new ResizeObserver(paintVideo).observe(media);paintVideo();
  let playing=false,replayReady=true,exitedAfterStart=true;
  card.addEventListener('pointerenter',()=>{
   if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
   if(playing||!replayReady||caseMotionReduced.matches)return;
   playing=true;replayReady=false;exitedAfterStart=false;video.currentTime=0;if(fadeVideo)fadeVideo.currentTime=0;
   const playback=video.play();
   if(fadeVideo){const fadePlayback=fadeVideo.play();if(fadePlayback)fadePlayback.catch(()=>{})}
   if(playback)playback.catch(()=>{playing=false;replayReady=true});
  });
  card.addEventListener('pointerleave',()=>{exitedAfterStart=true;if(!playing)replayReady=true});
  video.addEventListener('ended',()=>{playing=false;replayReady=exitedAfterStart});
  const playInitial=()=>{if(playing||caseMotionReduced.matches)return;playing=true;replayReady=false;exitedAfterStart=true;video.currentTime=0;if(fadeVideo)fadeVideo.currentTime=0;video.play().catch(()=>{playing=false;replayReady=true});fadeVideo?.play().catch(()=>{})};
  const observer=new IntersectionObserver(entries=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches&&entries.some(entry=>entry.isIntersecting)){playInitial();observer.disconnect()}},{threshold:.45});observer.observe(card);
 });
}

document.querySelectorAll('.tool').forEach(tool=>{
 tool.addEventListener('pointermove',event=>{
  const rect=tool.getBoundingClientRect(),x=Math.min(Math.max((event.clientX-rect.left)/rect.width,0),1),y=Math.min(Math.max((event.clientY-rect.top)/rect.height,0),1);
  tool.style.setProperty('--icon-x',`${(x*100).toFixed(1)}%`);tool.style.setProperty('--icon-y',`${(y*100).toFixed(1)}%`);tool.style.setProperty('--icon-pull-x',`${((x-.5)*8).toFixed(2)}px`);tool.style.setProperty('--icon-pull-y',`${((y-.5)*6).toFixed(2)}px`);
 });
 tool.addEventListener('pointerleave',()=>{tool.style.setProperty('--icon-x','50%');tool.style.setProperty('--icon-y','50%');tool.style.setProperty('--icon-pull-x','0px');tool.style.setProperty('--icon-pull-y','0px')});
});

const aboutStatement=document.querySelector('.about__statement');
if(aboutStatement&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const aboutLines=[...aboutStatement.querySelectorAll('.about-line')],aboutButton=aboutStatement.parentElement.querySelector('.about__work-link');aboutLines.forEach(line=>line.dataset.text=line.textContent);aboutStatement.closest('.about')?.classList.add('about--motion-ready');let aboutFrame=0;
 const clamp=value=>Math.min(Math.max(value,0),1),smooth=value=>value*value*(3-2*value);
 const updateAboutLines=()=>{aboutFrame=0;const viewportHeight=innerHeight;aboutLines.forEach((line,index)=>{const top=line.getBoundingClientRect().top,entry=smooth(clamp((viewportHeight*.98-top)/(viewportHeight*.48))),exit=smooth(clamp((viewportHeight*.12-top)/(viewportHeight*.22))),visible=entry*(1-exit),black=smooth(clamp((entry-.18)/.5))*(1-exit),blur=(1-visible)*15,y=(1-visible)*28-exit*18;line.style.setProperty('--line-opacity',(visible*.97).toFixed(4));line.style.setProperty('--line-black',black.toFixed(4));line.style.setProperty('--line-blur',`${blur.toFixed(2)}px`);line.style.setProperty('--line-y',`${y.toFixed(2)}px`);line.style.transitionDelay=`${index*12}ms`});if(aboutButton){const top=aboutButton.getBoundingClientRect().top,entry=smooth(clamp((viewportHeight*.96-top)/(viewportHeight*.38))),exit=smooth(clamp((viewportHeight*.1-top)/(viewportHeight*.2))),visible=entry*(1-exit);aboutButton.style.setProperty('--button-opacity',visible.toFixed(4));aboutButton.style.setProperty('--button-blur',`${((1-visible)*14).toFixed(2)}px`);aboutButton.style.setProperty('--button-y',`${((1-visible)*24-exit*16).toFixed(2)}px`)}};
 const requestAboutLines=()=>{if(!aboutFrame)aboutFrame=requestAnimationFrame(updateAboutLines)};addEventListener('scroll',requestAboutLines,{passive:true});addEventListener('resize',requestAboutLines,{passive:true});updateAboutLines();
}

const resume=document.querySelector('.resume-desktop');
if(resume){
 const keepPrepositionsWithNextWord=root=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{if(node.parentElement?.closest('script,style'))return;node.nodeValue=node.nodeValue.replace(/(^|[\s(—–-])(в|во|на|с|со|к|ко|у|о|об|обо|от|до|из|за|по|под|над|при|для|без|через|между)\s+/giu,'$1$2\u00a0')})};keepPrepositionsWithNextWord(resume);
 const chapters=[...resume.querySelectorAll('.resume-chapter')],labels=['Кто я','Опыт<br>и роли','Влияние<br>и отзывы','Инструменты<br>и развитие'],plainLabels=['Кто я','Опыт и роли','Влияние и отзывы','Инструменты и развитие'];
 const chapterMeta=chapters.map(chapter=>({count:chapter.querySelector('.resume-count')?.textContent||'',title:chapter.querySelector('.resume-side-title h2')?.innerHTML||'',subtitle:chapter.querySelector('.resume-side-title p')?.innerHTML||''}));
 let aboutGalleryFrame=0,directJumpTimer=0,directJumpActive=false;
 const scrollToChapter=index=>{if(index===currentAboutIndex)return;const distance=Math.max(resume.offsetHeight-innerHeight,1),target=resume.offsetTop+distance*(index/(chapters.length-1));directJumpActive=true;aboutComposition.classList.add('is-direct-jump');aboutComposition.getBoundingClientRect();scrollTo({top:target,behavior:'instant'});requestAboutGallery();clearTimeout(directJumpTimer);directJumpTimer=setTimeout(()=>{directJumpActive=false;aboutComposition.classList.remove('is-direct-jump');requestAboutGallery()},820)};
 const fixedSide=chapters[0].querySelector('.resume-side'),fixedNav=fixedSide.querySelector('.resume-nav'),fixedCount=fixedSide.querySelector('.resume-count'),fixedCasesLink=fixedSide.querySelector('.resume-cases-link'),fixedTitle=fixedSide.querySelector('.resume-side-title h2'),fixedSubtitle=fixedSide.querySelector('.resume-side-title p');
 labels.forEach((label,index)=>{const button=document.createElement('button');button.type='button';button.innerHTML=label;button.classList.toggle('is-active',index===0);button.setAttribute('aria-label',index===0?`Текущий раздел: ${plainLabels[index]}`:`Перейти к разделу ${plainLabels[index]}`);button.addEventListener('click',()=>scrollToChapter(index));fixedNav.appendChild(button)});
 const fixedNavButtons=[...fixedNav.querySelectorAll('button')],aboutStage=document.createElement('div'),aboutComposition=document.createElement('div'),contentViewport=document.createElement('div'),contentRail=document.createElement('div');aboutStage.className='about-gallery-stage';aboutComposition.className='about-composition';contentViewport.className='about-content-viewport';contentRail.className='about-content-rail';aboutStage.appendChild(aboutComposition);aboutComposition.appendChild(fixedSide);aboutComposition.appendChild(contentViewport);contentViewport.appendChild(contentRail);
 chapters.forEach(chapter=>{const card=chapter.querySelector('.resume-card');if(card)contentRail.appendChild(card);chapter.remove()});resume.appendChild(aboutStage);resume.classList.add('about-gallery');
 const clampAbout=value=>Math.min(Math.max(value,0),1);
 let currentAboutIndex=-1;
 const aboutCards=[...contentRail.querySelectorAll('.resume-card')],aboutCardHeight=550,smoothPage=value=>value*value*(3-2*value),navDots=[],aboutFrameBlur=document.querySelector('#about-frame-transition-blur feGaussianBlur'),reduceAboutMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 for(let dotIndex=1;dotIndex<15;dotIndex++){if(dotIndex%5===0)continue;const dot=document.createElement('span');dot.className='resume-nav-dot';dot.dataset.progress=String(dotIndex/15);fixedNav.appendChild(dot);navDots.push(dot)}
 if(fixedCasesLink)fixedCasesLink.addEventListener('click',event=>{event.preventDefault();const cases=document.querySelector('#work');if(!cases)return;directJumpActive=true;clearTimeout(directJumpTimer);scrollTo({top:cases.offsetTop,behavior:'instant'});history.replaceState(null,'',`${location.pathname}${location.search}#work`);directJumpTimer=setTimeout(()=>{directJumpActive=false},120)});
 const updateAboutGallery=()=>{aboutGalleryFrame=0;if(!matchMedia('(min-width: 1101px)').matches)return;const availableHeight=contentViewport.clientHeight,availableWidth=contentViewport.clientWidth,contentScale=Math.min(1,availableHeight/aboutCardHeight,Math.max(availableWidth,320)/816),renderedPanelHeight=aboutCardHeight*contentScale,compositionHeight=aboutComposition.clientHeight,compositionTop=(innerHeight-compositionHeight)/2,gutter=innerWidth*.05,outerInset=Math.max(0,gutter-compositionTop),linkHeight=fixedCasesLink?.offsetHeight||25,navTop=(compositionHeight-fixedNav.offsetHeight)/2,navCenter=compositionHeight/2,panelTop=Math.max(0,navCenter-renderedPanelHeight/2);contentRail.style.setProperty('--about-scale',contentScale.toFixed(4));aboutComposition.style.setProperty('--panel-render-height',`${renderedPanelHeight.toFixed(2)}px`);contentViewport.style.top=`${panelTop.toFixed(2)}px`;fixedNav.style.top=`${navTop.toFixed(2)}px`;if(fixedCount)fixedCount.style.top=`${outerInset.toFixed(2)}px`;if(fixedCasesLink)fixedCasesLink.style.top=`${(compositionHeight-outerInset-linkHeight).toFixed(2)}px`;aboutCards.forEach(card=>card.style.width='816px');const distance=Math.max(resume.offsetHeight-innerHeight,1),rawProgress=clampAbout((scrollY-resume.offsetTop)/distance)*(chapters.length-1),base=Math.min(Math.floor(rawProgress),chapters.length-2),local=rawProgress-base,turn=smoothPage(clampAbout((local-.22)/.56)),pageProgress=rawProgress>=chapters.length-1?chapters.length-1:base+turn,navProgress=pageProgress/(chapters.length-1),navRouteHeight=Math.max(fixedNav.offsetHeight-24,0),pageFraction=pageProgress-Math.floor(pageProgress),framePulse=Math.sin(Math.PI*pageFraction),frameBlurPulse=reduceAboutMotion?0:framePulse;if(aboutFrameBlur)aboutFrameBlur.setAttribute('stdDeviation',`${(.8*frameBlurPulse).toFixed(2)} ${(2.2*frameBlurPulse).toFixed(2)}`);fixedNav.style.setProperty('--nav-progress',navProgress.toFixed(4));fixedNav.style.setProperty('--nav-clip',`${((1-navProgress)*100).toFixed(3)}%`);contentViewport.style.setProperty('--about-frame-lift',`${(-12*framePulse).toFixed(2)}px`);contentViewport.style.setProperty('--about-frame-scale',(1+.014*framePulse).toFixed(5));navDots.forEach(dot=>{const dotProgress=Number(dot.dataset.progress);dot.style.top=`${(8+navRouteHeight*dotProgress).toFixed(2)}px`;dot.classList.toggle('is-passed',dotProgress<=navProgress+.001)});aboutCards.forEach((card,index)=>{const delta=index-pageProgress,visibility=clampAbout(1-Math.abs(delta)),departure=1-visibility,direction=Math.sign(delta)||0,blurDeparture=direction<0?clampAbout((departure-.18)/.82):direction>0?clampAbout(departure/.82):0;card.style.transform=`translate3d(0,${(direction*departure*54).toFixed(2)}px,0)`;card.style.filter=`blur(${(blurDeparture*18).toFixed(2)}px) saturate(${(1+blurDeparture*.18).toFixed(3)})`;card.style.opacity=Math.pow(visibility,.82).toFixed(4);card.style.zIndex=String(10-Math.round(Math.abs(delta)*2));card.style.pointerEvents=Math.abs(delta)<.5?'auto':'none';card.inert=Math.abs(delta)>=.5});const activeIndex=Math.min(Math.round(pageProgress),chapters.length-1);if(fixedCasesLink){const hideCasesLink=activeIndex===chapters.length-1;fixedCasesLink.classList.toggle('is-hidden',hideCasesLink);fixedCasesLink.inert=hideCasesLink;}if(activeIndex!==currentAboutIndex){currentAboutIndex=activeIndex;const meta=chapterMeta[activeIndex];if(fixedCount)fixedCount.textContent=meta.count;if(fixedTitle)fixedTitle.innerHTML=meta.title;if(fixedSubtitle)fixedSubtitle.innerHTML=meta.subtitle;fixedNavButtons.forEach((button,index)=>{button.classList.toggle('is-active',index===activeIndex);button.classList.toggle('is-passed',index<activeIndex);button.setAttribute('aria-label',index===activeIndex?`Текущий раздел: ${plainLabels[index]}`:`Перейти к разделу ${plainLabels[index]}`)})}};
 const impactCard=contentRail.querySelector('.resume-card--impact'),syncImpactReveal=()=>{if(!impactCard)return;impactCard.classList.toggle('is-current',Number.parseFloat(impactCard.style.opacity||'0')>.72)};
 if(impactCard)new MutationObserver(syncImpactReveal).observe(impactCard,{attributes:true,attributeFilter:['style']});
 const requestAboutGallery=()=>{if(!aboutGalleryFrame)aboutGalleryFrame=requestAnimationFrame(updateAboutGallery)};
 // Finish a partial transition after scrolling stops, without moving through
 // the full chapter's reading area or pulling the reader back from the cases.
 let aboutSettleTimer=0,aboutSettleFrame=0,aboutSettling=false,aboutPointerDown=false;
 const cancelAboutSettle=()=>{clearTimeout(aboutSettleTimer);cancelAnimationFrame(aboutSettleFrame);aboutSettleFrame=0;aboutSettling=false};
 const settleAboutGallery=()=>{
  if(directJumpActive||aboutPointerDown||document.visibilityState!=='visible'||!matchMedia('(min-width: 1101px)').matches)return;
  const distance=Math.max(resume.offsetHeight-innerHeight,1),step=distance/(chapters.length-1),progress=(scrollY-resume.offsetTop)/step;
  if(progress<=0||progress>=chapters.length-1)return;
  const base=Math.floor(progress),fraction=progress-base;
  if(fraction<=.22||fraction>=.78)return;
  const target=resume.offsetTop+(base+(fraction<.5?.20:.80))*step,start=scrollY,started=performance.now();
  aboutSettling=true;
  const tick=now=>{
   if(directJumpActive||!matchMedia('(min-width: 1101px)').matches){cancelAboutSettle();return}
   const t=reduceAboutMotion?1:Math.min((now-started)/480,1),eased=t*t*(3-2*t);
   scrollTo({top:start+(target-start)*eased,behavior:'instant'});requestAboutGallery();
   if(t<1)aboutSettleFrame=requestAnimationFrame(tick);
   else{aboutSettleFrame=0;aboutSettling=false}
  };
  aboutSettleFrame=requestAnimationFrame(tick);
 };
 const queueAboutSettle=()=>{clearTimeout(aboutSettleTimer);if(!aboutSettling&&!aboutPointerDown)aboutSettleTimer=setTimeout(settleAboutGallery,240)};
 addEventListener('scroll',()=>{requestAboutGallery();queueAboutSettle()},{passive:true});
 addEventListener('wheel',cancelAboutSettle,{passive:true});
 addEventListener('touchstart',cancelAboutSettle,{passive:true});
 addEventListener('pointerdown',()=>{aboutPointerDown=true;cancelAboutSettle()},{passive:true});
 addEventListener('pointerup',()=>{aboutPointerDown=false;queueAboutSettle()},{passive:true});
 addEventListener('pointercancel',()=>{aboutPointerDown=false;queueAboutSettle()},{passive:true});
 addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))cancelAboutSettle()});
 addEventListener('resize',()=>{cancelAboutSettle();requestAboutGallery();queueAboutSettle()},{passive:true});
 document.addEventListener('visibilitychange',()=>{cancelAboutSettle();if(document.visibilityState==='visible')queueAboutSettle()});
 updateAboutGallery();syncImpactReveal();queueAboutSettle();

 let reviewIndex=0,reviewTimer=0,reviewTransitionTimer=0;
 const reviewTrack=resume.querySelector('.review-track'),reviewSlider=reviewTrack?.closest('.review-slider'),reviewQuotes=[...resume.querySelectorAll('.review-track blockquote')],reviewDots=[...resume.querySelectorAll('.review-dots button')];
 const showReview=index=>{const nextIndex=(index+reviewQuotes.length)%reviewQuotes.length,previousIndex=reviewIndex;clearTimeout(reviewTransitionTimer);reviewQuotes.forEach((quote,i)=>{if(i===previousIndex&&previousIndex!==nextIndex){quote.classList.remove('is-active');quote.classList.add('is-leaving')}else if(i!==nextIndex){quote.classList.remove('is-active','is-leaving')}});reviewIndex=nextIndex;reviewQuotes[reviewIndex]?.classList.remove('is-leaving');reviewQuotes[reviewIndex]?.classList.add('is-active');reviewTransitionTimer=setTimeout(()=>reviewQuotes.forEach((quote,i)=>{if(i!==reviewIndex)quote.classList.remove('is-leaving')}),520);const copyHeight=reviewQuotes[reviewIndex]?.querySelector('p')?.offsetHeight||56;if(reviewSlider)reviewSlider.style.setProperty('--review-footer-top',`${copyHeight+12}px`);reviewDots.forEach((dot,i)=>{if(i===reviewIndex)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current')})};
 const startReviews=()=>{clearInterval(reviewTimer);reviewTimer=setInterval(()=>showReview(reviewIndex+1),5200)};
 if(reviewTrack&&reviewSlider){const reviewsCanAuto=!matchMedia('(prefers-reduced-motion: reduce)').matches;let reviewPointerY=null;reviewDots.forEach((dot,index)=>dot.addEventListener('click',()=>{showReview(index);if(reviewsCanAuto)startReviews()}));reviewSlider.addEventListener('pointerdown',event=>{reviewPointerY=event.clientY;reviewSlider.setPointerCapture(event.pointerId)});reviewSlider.addEventListener('pointerup',event=>{if(reviewPointerY!==null&&Math.abs(event.clientY-reviewPointerY)>42)showReview(reviewIndex+(event.clientY<reviewPointerY?1:-1));reviewPointerY=null;if(reviewsCanAuto)startReviews()});reviewSlider.addEventListener('pointercancel',()=>{reviewPointerY=null});showReview(0);if(reviewsCanAuto){startReviews();reviewSlider.addEventListener('pointerenter',()=>clearInterval(reviewTimer));reviewSlider.addEventListener('pointerleave',()=>{if(!reviewSlider.contains(document.activeElement))startReviews()});reviewSlider.addEventListener('focusin',()=>clearInterval(reviewTimer));reviewSlider.addEventListener('focusout',event=>{if(!reviewSlider.contains(event.relatedTarget))startReviews()})}}

 const toolName=resume.querySelector('.tool-description strong'),toolCopy=resume.querySelector('.tool-description p'),stack=resume.querySelector('.resume-stack'),toolColumn=resume.querySelector('.practice-tool-column'),sourceToolButtons=[...resume.querySelectorAll('.resume-stack button')];
 if(stack&&toolColumn&&sourceToolButtons.length){const toolCount=sourceToolButtons.length,step=84;sourceToolButtons.forEach((button,index)=>button.dataset.toolIndex=String(index));[...sourceToolButtons,...sourceToolButtons].forEach(button=>stack.appendChild(button.cloneNode(true)));const stackButtons=[...stack.querySelectorAll('button')];let physicalIndex=toolCount+(sourceToolButtons.findIndex(button=>button.dataset.tool==='Photoshop')+toolCount)%toolCount,wheelLocked=false;const logicalIndex=()=>((physicalIndex%toolCount)+toolCount)%toolCount;const activeButton=()=>sourceToolButtons[logicalIndex()];const keepWithNext=text=>text.replace(/(^|\s)(а|без|в|во|для|до|за|и|из|к|на|над|не|о|об|от|по|под|при|про|с|у)\s+/giu,(_,space,word)=>`${space}${word}\u00a0`);const showTool=button=>{toolName.textContent=button.dataset.tool;toolCopy.textContent=keepWithNext(button.dataset.description)};const selectedIconTop=()=>{const columnRect=toolColumn.getBoundingClientRect(),scale=columnRect.height/toolColumn.offsetHeight||1;return (toolName.getBoundingClientRect().top-columnRect.top)/scale-4};const renderTools=(animate=true)=>{const active=logicalIndex();showTool(activeButton());stack.style.transition=animate?'transform .62s cubic-bezier(.22,.68,.16,1)':'none';stack.style.transform=`translateY(${selectedIconTop()-physicalIndex*step}px)`;stackButtons.forEach((button,index)=>{button.classList.toggle('is-active',index===physicalIndex);button.classList.toggle('is-above-active',index<physicalIndex);button.classList.toggle('is-below-active',index>physicalIndex);const image=button.querySelector('img'),distance=Math.min(Math.abs(index-physicalIndex),6);if(image){image.style.filter=`blur(${(Math.min(distance,4)*1.15).toFixed(2)}px)`;image.style.opacity=String(Math.max(.4,1-distance*.1))}})};const settleLoop=()=>{if(physicalIndex<toolCount||physicalIndex>=toolCount*2){stack.classList.add('is-instant');physicalIndex=toolCount+logicalIndex();renderTools(false);stack.getBoundingClientRect();stack.classList.remove('is-instant')}wheelLocked=false};const moveTools=direction=>{if(wheelLocked)return;wheelLocked=true;physicalIndex+=direction;renderTools(true)};stack.addEventListener('transitionend',event=>{if(event.target===stack)settleLoop()});toolColumn.addEventListener('wheel',event=>{event.preventDefault();moveTools(event.deltaY>=0?1:-1)},{passive:false});stackButtons.forEach(button=>button.addEventListener('click',()=>{const target=Number(button.dataset.toolIndex),current=logicalIndex(),forward=(target-current+toolCount)%toolCount,backward=forward-toolCount;physicalIndex+=Math.abs(backward)<forward?backward:forward;renderTools(true)}));renderTools(false);addEventListener('resize',()=>renderTools(false),{passive:true})}

 resume.querySelectorAll('.process-node').forEach(node=>{let drag=null;node.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY,left:node.offsetLeft,top:node.offsetTop};node.setPointerCapture(event.pointerId)});node.addEventListener('pointermove',event=>{if(!drag)return;const card=node.parentElement,maxX=card.clientWidth-node.offsetWidth,maxY=card.clientHeight-node.offsetHeight;node.style.left=`${Math.max(0,Math.min(maxX,drag.left+event.clientX-drag.x))}px`;node.style.top=`${Math.max(0,Math.min(maxY,drag.top+event.clientY-drag.y))}px`});node.addEventListener('pointerup',()=>{drag=null});node.addEventListener('pointercancel',()=>{drag=null})});
}

// Resolve About to the visible layout rather than a hidden anchor.
document.querySelectorAll('.nav a[href="#about"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const target=document.querySelector(matchMedia('(min-width:1101px)').matches?'#resume':'#about-mobile');target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}));

// Gallery focus follows the case scroll viewport, never the pointer.
document.querySelectorAll('.scroll-gallery').forEach(gallery=>{
 const items=[...gallery.querySelectorAll('.case-gallery__item')];
 const scroller=gallery.closest('.case-study__scroll');
 const panel=gallery.closest('.case-study');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,previousTime=0;
 const strengths=items.map(()=>0);
 const update=time=>{
  frame=0;
  if(panel.hidden||!panel.classList.contains('is-open')){previousTime=0;return;}
  const viewport=scroller.getBoundingClientRect();
  const galleryBox=gallery.getBoundingClientRect();
  if(galleryBox.bottom<viewport.top||galleryBox.top>viewport.bottom){previousTime=0;return;}
  const center=viewport.top+viewport.height*.52;
  // offset geometry is stable while the visual mask/scale animates.
  const distances=items.map(item=>Math.abs(galleryBox.top+item.offsetTop+item.offsetHeight/2-center));
  let active=distances.indexOf(Math.min(...distances));
  const last=items[items.length-1];
  const lastCenter=galleryBox.top+last.offsetTop+last.offsetHeight/2;
  // The last frame must be reachable even when the page ends before its center.
  if(scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop<=2&&lastCenter>=viewport.top&&lastCenter<=viewport.bottom)active=items.length-1;
  const delta=previousTime?Math.min(time-previousTime,64):16;
  previousTime=time;

  let moving=false;
  items.forEach((item,index)=>{
   const target=reduced.matches?1:index===active?1:Math.abs(index-active)===1?.08:0;
   const duration=target<strengths[index]?364:260;
   const ease=1-Math.exp(-delta/duration);
   strengths[index]=reduced.matches?1:strengths[index]+(target-strengths[index])*ease;
   if(Math.abs(target-strengths[index])<.002)strengths[index]=target;else moving=true;
   const strength=strengths[index];
   item.style.setProperty('--reveal-inset',`${(14*(1-strength)).toFixed(3)}%`);
   item.style.setProperty('--reveal-scale',(.94+.06*strength).toFixed(4));
   item.style.setProperty('--reveal-opacity',(.65+.35*strength).toFixed(4));
   item.classList.toggle('is-scroll-active',index===active);
   if(index!==active||reduced.matches){item.style.setProperty('--parallax-x','0px');item.style.setProperty('--parallax-y','0px');}
  });
  if(moving)frame=requestAnimationFrame(update);else previousTime=0;
 };
 const request=()=>{if(!frame)frame=requestAnimationFrame(update)};
 items.forEach(item=>{
  const reset=()=>{item.style.setProperty('--parallax-x','0px');item.style.setProperty('--parallax-y','0px')};
  item.addEventListener('pointermove',event=>{
   if(reduced.matches||event.pointerType!=='mouse'||!item.classList.contains('is-scroll-active'))return;
   const rect=item.getBoundingClientRect();
   const clamp=value=>Math.max(-1,Math.min(1,value));
   item.style.setProperty('--parallax-x',`${(clamp((event.clientX-rect.left)/rect.width*2-1)*3).toFixed(2)}px`);
   item.style.setProperty('--parallax-y',`${(clamp((event.clientY-rect.top)/rect.height*2-1)*3).toFixed(2)}px`);
  });
  item.addEventListener('pointerleave',reset);
  item.addEventListener('pointercancel',reset);
 });
 scroller.addEventListener('scroll',request,{passive:true});
 addEventListener('resize',request,{passive:true});
 reduced.addEventListener('change',request);
 new ResizeObserver(request).observe(gallery);
 new MutationObserver(request).observe(panel,{attributes:true,attributeFilter:['hidden','class']});
 request();
});

// Experience nodes use local card coordinates so dragging also works in scaled slides.
(()=>{
 const card=document.querySelector('.resume-card--experience'),svg=card?.querySelector('.experience-network');if(!svg)return;
 const nodes=[...card.querySelectorAll('.experience-period__identity,.experience-period__content')],offsets=new Map(nodes.map(n=>[n,{x:0,y:0}]));
 const ns='http://www.w3.org/2000/svg';
 const draw=()=>{
  const r=card.getBoundingClientRect(),scale=r.width/card.offsetWidth;if(!scale)return;
  svg.replaceChildren();
  const point=(n,side)=>{const b=n.getBoundingClientRect();return {x:(b.left-r.left+(side==='right'?b.width:side==='left'?0:b.width/2))/scale,y:(b.top-r.top+(side==='bottom'?b.height:side==='top'?0:b.height/2))/scale}};
  const join=(a,b,vertical=false)=>{
   const p=document.createElementNS(ns,'path'),span=vertical?Math.max(40,Math.abs(b.y-a.y)*.6):Math.max(30,Math.abs(b.x-a.x)*.55);
   p.setAttribute('d',vertical?`M${a.x} ${a.y} C${a.x} ${a.y+span} ${b.x} ${b.y-span} ${b.x} ${b.y}`:`M${a.x} ${a.y} C${a.x+span} ${a.y} ${b.x-span} ${b.y} ${b.x} ${b.y}`);
   if(vertical)p.setAttribute('class','experience-network__journey');svg.append(p);
   [a,b].forEach(v=>{const dot=document.createElementNS(ns,'circle');dot.setAttribute('class','node-port');dot.setAttribute('cx',v.x);dot.setAttribute('cy',v.y);dot.setAttribute('r','3');svg.append(dot)});
  };
  join(point(nodes[0],'right'),point(nodes[1],'left'));join(point(nodes[2],'right'),point(nodes[3],'left'));join(point(nodes[0],'bottom'),point(nodes[2],'top'),true);
  const tailStart=point(nodes[2],'bottom'),tailEnd=card.offsetHeight+48,tail=document.createElementNS(ns,'path');
  tail.setAttribute('class','experience-network__journey');
  tail.setAttribute('d',`M${tailStart.x} ${tailStart.y} C${tailStart.x} ${tailStart.y+70} ${tailStart.x+48} ${tailEnd-70} ${tailStart.x+48} ${tailEnd}`);svg.append(tail);
  const tailDot=document.createElementNS(ns,'circle');tailDot.setAttribute('class','node-port');tailDot.setAttribute('cx',tailStart.x);tailDot.setAttribute('cy',tailStart.y);tailDot.setAttribute('r','3');svg.append(tailDot);
 };
 nodes.forEach(node=>{
  let drag=null;
  node.addEventListener('pointerdown',e=>{
   if(e.button!==0||!matchMedia('(min-width:1101px)').matches)return;
   const r=card.getBoundingClientRect(),b=node.getBoundingClientRect(),scale=r.width/card.offsetWidth,o=offsets.get(node);
   drag={id:e.pointerId,x:e.clientX,y:e.clientY,ox:o.x,oy:o.y,scale,left:(b.left-r.left)/scale,top:(b.top-r.top)/scale};
   node.setPointerCapture(e.pointerId);node.classList.add('is-dragging');e.preventDefault();
  });
  node.addEventListener('pointermove',e=>{
   if(!drag)return;
   const dx=Math.max(24-drag.left,Math.min(card.offsetWidth-24-node.offsetWidth-drag.left,(e.clientX-drag.x)/drag.scale));
   const dy=Math.max(124-drag.top,Math.min(card.offsetHeight-24-node.offsetHeight-drag.top,(e.clientY-drag.y)/drag.scale));
   const o={x:drag.ox+dx,y:drag.oy+dy};offsets.set(node,o);node.style.translate=`${o.x}px ${o.y}px`;draw();
  });
  const end=()=>{drag=null;node.classList.remove('is-dragging');draw()};
  node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);node.addEventListener('lostpointercapture',end);
 });
 new ResizeObserver(draw).observe(card);requestAnimationFrame(draw);
})();

// Switch cases through the same route/controller flow as browser navigation.
document.querySelectorAll('[data-next-case]').forEach(link=>link.addEventListener('click',event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const id=link.dataset.nextCase;if(!caseControllers.has(id))return;
 event.preventDefault();routeToCase(id);syncCaseRoute();
}));


// Touch playback is armed again only after the media leaves the central zone.
(()=>{
 const touch=matchMedia('(hover:none), (pointer:coarse)');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const items=[...document.querySelectorAll('video.case__video')].filter(v=>!v.loop).map(video=>({video,area:video.closest('.case__media,.case-study__hero-media')||video,entered:false}));
 let frame=0;
 function update(){
  frame=0;
  if(!touch.matches||reduced.matches||document.hidden)return;
  const modal=document.querySelector('.case-study.is-open');
  for(const item of items){
   const {video,area}=item,owner=video.closest('.case-study');
   if((owner&&!owner.classList.contains('is-open'))||(!owner&&modal)||!area.getClientRects().length){item.entered=false;continue}
   const r=area.getBoundingClientRect(),center=innerHeight*.5;
   if(r.bottom<innerHeight*.35||r.top>innerHeight*.65){item.entered=false;continue}
   if(!item.entered&&r.top<=center&&r.bottom>=center&&r.width&&r.height){
    item.entered=true;video.muted=true;video.currentTime=0;video.play().catch(()=>{});
   }
  }
 }
 const queue=()=>{if(!frame)frame=requestAnimationFrame(update)};
 document.addEventListener('scroll',queue,{capture:true,passive:true});
 addEventListener('resize',queue,{passive:true});
 document.addEventListener('visibilitychange',queue);
 touch.addEventListener('change',()=>{items.forEach(item=>item.entered=false);queue()});
 new MutationObserver(queue).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.querySelectorAll('.case-study').forEach(modal=>new MutationObserver(queue).observe(modal,{attributes:true,attributeFilter:['class','hidden']}));
 items.forEach(({video})=>video.addEventListener('loadeddata',queue));
 queue();
})();

// Keep the active compact case chapter reachable in its horizontal navigation.
document.querySelectorAll('.case-study__nav').forEach(nav=>{
 let active=null;
 const sync=()=>{if(!matchMedia('(max-width:1100px)').matches)return;const next=nav.querySelector('.is-active');if(!next||next===active)return;active=next;
  const r=next.getBoundingClientRect(),n=nav.getBoundingClientRect();
  if(r.left<n.left+20||r.right>n.right-20)nav.scrollTo({left:nav.scrollLeft+r.left-n.left-20,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 };
 new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});sync();
});

// Load nearby media and resume visible looping videos after tab/app interruptions.
(()=>{
 const videos=[...document.querySelectorAll('video:not(.case__video-fade)')];
 const near=new Set(),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const eligible=video=>{const panel=video.closest('.case-study');return (!panel||!panel.hidden)&&!(video.closest('main')&&document.body.classList.contains('case-study-open'))&&(!video.classList.contains('case-motion__video')||video.classList.contains('is-active'))};
 const resume=video=>{if(!video.loop||!eligible(video)||!near.has(video)||document.hidden||reduced.matches)return;video.muted=true;video.playsInline=true;if(video.paused)video.play().catch(()=>{})};
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){near.add(target);target.preload='auto';resume(target)}else{near.delete(target);if(target.loop)target.pause()}}),{rootMargin:'180px'});
 videos.forEach(video=>{video.muted=true;video.playsInline=true;observer.observe(video);video.addEventListener('canplay',()=>resume(video));video.addEventListener('loadeddata',()=>resume(video));new MutationObserver(()=>resume(video)).observe(video,{attributes:true,attributeFilter:['class']})});
 const refresh=()=>videos.forEach(resume);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.filter(v=>v.loop).forEach(v=>v.pause());else refresh()});
 addEventListener('pageshow',refresh);document.addEventListener('pointerup',refresh,{passive:true});reduced.addEventListener('change',()=>{if(reduced.matches)videos.filter(v=>v.loop).forEach(v=>v.pause());else refresh()});
 document.querySelectorAll('[data-before-after],[data-process-slider],.case-gallery').forEach(group=>{const loader=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){group.querySelectorAll('img').forEach(image=>image.loading='eager');loader.disconnect()}},{rootMargin:'500px'});loader.observe(group)});
})();
