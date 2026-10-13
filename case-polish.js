// Reuse existing controllers for automatic variants and before/after comparisons.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const interval=4000;
 const videoInterval=6000;
 const groups=[];
 const add=(root,buttons,delay=interval)=>{if(buttons.length<2)return null;const group={root,buttons,interval:delay,nextAt:0,manualUntil:0,visible:false,autoClick:false};groups.push(group);return group;};
 document.querySelectorAll('.case-motion').forEach(root=>add(root,[...root.querySelectorAll('.case-motion__controls button')],videoInterval));
 document.querySelectorAll('[data-insurance-slider]').forEach(root=>add(root,[...root.querySelectorAll('[data-slide]')]));
 document.querySelectorAll('[data-process-slider]').forEach(root=>{const group=add(root,[...root.querySelectorAll('[data-stage]')]);if(group)group.processRange=root.querySelector('input[type="range"]');});
 document.querySelectorAll('.review-slider').forEach(root=>add(root,[...root.querySelectorAll('.review-dots button')]));
 document.querySelectorAll('[data-before-after]').forEach(root=>{
  const range=root.querySelector('input[type="range"]');if(range)groups.push({root,range,interval,nextAt:0,manualUntil:0,visible:false,phase:0});
 });
 groups.forEach(group=>{
  const pause=()=>{group.manualUntil=performance.now()+group.interval;};
  group.root.addEventListener('pointerdown',()=>{group.dragging=true;group.animation=0;pause();},{passive:true});
  const release=()=>{if(!group.dragging)return;group.dragging=false;pause();};
  window.addEventListener('pointerup',release,{passive:true});window.addEventListener('pointercancel',release,{passive:true});
  group.root.addEventListener('keydown',pause);
  group.root.addEventListener('input',()=>{if(!group.autoInput)pause()});
  group.root.addEventListener('click',()=>{if(!group.autoClick)pause()});
 });
 const isVisible=root=>{
  const owner=root.closest('.case-study');if(owner&&(owner.hidden||!owner.classList.contains('is-open')))return false;
  if(!root.getClientRects().length)return false;
  const r=root.getBoundingClientRect();return r.bottom>innerHeight*.12&&r.top<innerHeight*.88;
 };
 const videos=[...document.querySelectorAll('video:not(.case__video-fade)')];
 const playRequests=new WeakSet();
 videos.forEach(video=>{video.loop=true;video.muted=true;video.playsInline=true;});
 const waitForFrame=video=>new Promise((resolve,reject)=>{
  if(video.readyState>=2){resolve();return;}
  const clear=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',ready);video.removeEventListener('error',fail)};
  const ready=()=>{clear();resolve()},fail=()=>{clear();reject(new Error('Video unavailable'))};
  const timer=setTimeout(fail,10000);
  video.addEventListener('loadeddata',ready,{once:true});video.addEventListener('error',fail,{once:true});
  video.preload='auto';video.load();
 });
 const prepareVariant=async(group,index)=>{
  const motion=[...group.root.querySelectorAll('.case-motion__video')];
  if(motion[index]){await waitForFrame(motion[index]);return;}
  const stages=[...group.root.querySelectorAll('.junior-process__stage img')];
  if(stages[index]){stages[index].loading='eager';await stages[index].decode();return;}
  const src=group.buttons[index]?.dataset.slide;
  if(src){const image=new Image();image.src=src;await image.decode();}
 };
 // Preserve the old insurance image over the new one until decoding completes.
 document.querySelectorAll('[data-insurance-slider]').forEach(root=>{
  const image=root.querySelector('.insurance-visual img');if(!image)return;
  let hold=null,version=0;
  root.addEventListener('click',event=>{
   if(!event.target.closest('[data-slide]'))return;
   const token=++version;hold?.remove();hold=image.cloneNode(true);hold.classList.add('variant-hold');hold.setAttribute('aria-hidden','true');hold.alt='';image.parentElement.append(hold);
   const currentHold=hold;
   setTimeout(()=>{if(token===version)currentHold.remove();},10000);
  },true);
  new MutationObserver(()=>{
   const currentHold=hold,token=version;if(!currentHold)return;
   image.decode().then(()=>{if(token!==version)return;currentHold.style.opacity='0';setTimeout(()=>{currentHold.remove();if(hold===currentHold)hold=null;},700);}).catch(()=>{});
  }).observe(image,{attributes:true,attributeFilter:['src']});
 });
 document.querySelectorAll('.case-motion__video').forEach(video=>{video.preload='auto';});
 const refresh=()=>{
  const now=performance.now();
  groups.forEach(group=>{
   const usable=!document.hidden&&isVisible(group.root);
   const paused=group.dragging||now<group.manualUntil;
   if(!usable){group.visible=false;group.nextAt=0;return;}
   if(paused){group.nextAt=Math.max(group.nextAt,group.manualUntil);return;}
   if(!group.visible){group.root.querySelectorAll('img').forEach(image=>image.loading='eager');group.visible=true;group.nextAt=now+group.interval;group.phase=now;return;}
   if(now<group.nextAt||group.switching)return;
   group.nextAt=now+group.interval;
   if(group.range){
    const from=Number(group.range.value),to=from<50?85:15,start=performance.now();
    const token=group.animation=(group.animation||0)+1;
    const frame=now=>{
     if(group.animation!==token||group.dragging||document.hidden||!isVisible(group.root))return;
     const t=reduced.matches?1:Math.min(1,(now-start)/650),ease=t*t*(3-2*t);
     group.autoInput=true;group.range.value=String(from+(to-from)*ease);group.range.dispatchEvent(new Event('input',{bubbles:true}));group.autoInput=false;
     if(t<1)requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);return;
   }
   const current=group.buttons.findIndex(button=>button.getAttribute('aria-pressed')==='true'||button.getAttribute('aria-current')==='true'||button.classList.contains('is-active'));
   const index=(Math.max(0,current)+1)%group.buttons.length;
   group.switching=true;
   prepareVariant(group,index).then(()=>{
    if(document.hidden||!isVisible(group.root)||group.dragging||performance.now()<group.manualUntil)return;
    if(group.processRange){
     group.autoInput=true;group.processRange.value=String(group.buttons[index].dataset.stage);group.processRange.dispatchEvent(new Event('input',{bubbles:true}));group.autoInput=false;
    }else{group.autoClick=true;group.buttons[index].click();group.autoClick=false;}
    group.nextAt=performance.now()+group.interval;
   }).catch(()=>{}).finally(()=>{group.switching=false;});
  });
  videos.forEach(video=>{
   const owner=video.closest('.case-study');
   const inactive=video.classList.contains('case-motion__video')&&!video.classList.contains('is-active');
   const blockedMain=!owner&&document.body.classList.contains('case-study-open');
   const eligible=!document.hidden&&!inactive&&!blockedMain&&isVisible(video);
   if(!eligible){if(!video.paused)video.pause();return;}
   if(video.paused&&!playRequests.has(video)){
    playRequests.add(video);video.play().catch(()=>{}).finally(()=>playRequests.delete(video));
   }
  });
 };
 // Timers stop advancing hidden/off-screen groups and restart after manual inspection.
 setInterval(refresh,100);
 document.addEventListener('visibilitychange',refresh);
 reduced.addEventListener('change',refresh);
 refresh();
})();
