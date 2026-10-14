// Independent seamless review ribbons; the stationary edge masks keep the middle clear.
(()=>{
 const rows=[...document.querySelectorAll('.footer-reviews__row')];if(!rows.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let pendingFrame=0,previous=0;
 const wake=()=>{if(!pendingFrame&&!document.hidden)pendingFrame=requestAnimationFrame(tick)};
 const moving=s=>s.visible&&!s.drag&&(Math.abs(s.pending)>.01||Math.abs(s.velocity)>.01||(!reduced.matches&&!s.hover&&!s.focus));
 const states=rows.map((row,index)=>{
  const track=row.querySelector('.footer-reviews__track'), originals=[...track.children];
  row.setAttribute('contenteditable','false');
  originals.forEach(card=>{card.removeAttribute('tabindex');card.setAttribute('contenteditable','false')});
  const overlay=document.createElement('div');overlay.className='footer-reviews__edge-blur';overlay.setAttribute('aria-hidden','true');
  for(let level=1;level<=4;level++){const layer=document.createElement('span');layer.className='footer-reviews__blur-layer footer-reviews__blur-layer--'+level;overlay.append(layer)}
  row.append(overlay);
  return {row,track,originals,index,period:0,x:0,pending:0,velocity:0,direction:index?1:-1,hover:false,focus:false,visible:true,drag:null};
 });
 const paint=s=>{if(!s.period)return;const x=((s.x%s.period)+s.period)%s.period-s.period;s.track.style.transform=`translate3d(${x}px,0,0)`};
 const rebuild=()=>states.forEach(s=>{
  s.track.querySelectorAll('[data-review-copy]').forEach(n=>n.remove());
  const gap=parseFloat(getComputedStyle(s.track).gap)||28;
  s.pitch=s.originals[0].offsetWidth+gap;s.period=s.pitch*s.originals.length;
  const repeats=Math.ceil(innerWidth/s.period)+3;
  for(let copy=1;copy<repeats;copy++)s.originals.forEach(card=>{const clone=card.cloneNode(true);clone.dataset.reviewCopy='';clone.setAttribute('aria-hidden','true');clone.removeAttribute('tabindex');s.track.append(clone)});
  const first=s.originals.find(n=>!n.classList.contains('footer-review-card--empty'));
  s.x=innerWidth/2-first.offsetLeft-first.offsetWidth/2-s.index*s.pitch/2;s.pending=0;paint(s);
 });
 states.forEach(s=>{
  const {row}=s;
  row.addEventListener('pointerenter',()=>s.hover=true);
  row.addEventListener('pointerleave',()=>{s.hover=false;wake()});
  row.addEventListener('focusin',()=>s.focus=true);
  row.addEventListener('focusout',()=>{s.focus=false;wake()});
  row.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();s.drag={id:e.pointerId,last:e.clientX};s.pending=0;row.setPointerCapture(e.pointerId);row.classList.add('is-dragging')});
  row.addEventListener('pointermove',e=>{if(!s.drag||e.pointerId!==s.drag.id)return;s.x+=e.clientX-s.drag.last;s.drag.last=e.clientX;paint(s)});
  const release=()=>{s.drag=null;row.classList.remove('is-dragging');wake()};
  row.addEventListener('pointerup',release);row.addEventListener('pointercancel',release);row.addEventListener('lostpointercapture',release);
  row.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.shiftKey){e.preventDefault();s.pending-=e.deltaX||e.deltaY;wake()}},{passive:false});
  row.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();s.pending+=e.key==='ArrowRight'?-s.pitch:s.pitch;wake()});
 });
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const s=states.find(s=>s.row===entry.target);if(s){s.visible=entry.isIntersecting;wake()}}));states.forEach(s=>observer.observe(s.row));

 const tick=time=>{
  pendingFrame=0;
  const dt=Math.min((time-(previous||time))/1000,.05);previous=time;
  if(document.visibilityState==='visible')states.forEach(s=>{
   if(!s.visible||s.drag)return;
   const target=reduced.matches||s.hover||s.focus?0:12*s.direction;
   s.velocity+=(target-s.velocity)*(1-Math.exp(-dt/.65));
   const manual=s.pending*(1-Math.exp(-dt/.14));s.pending-=manual;
   s.x+=s.velocity*dt+manual;paint(s);
  });
  if(!document.hidden&&states.some(moving))wake();else previous=0;
 };
 addEventListener('resize',rebuild,{passive:true});document.fonts.ready.then(rebuild);rebuild();wake();
 document.addEventListener('visibilitychange',()=>{previous=0;wake()});reduced.addEventListener('change',wake);
})();
