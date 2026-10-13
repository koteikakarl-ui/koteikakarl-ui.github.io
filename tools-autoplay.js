// One shared clock; use each layout's existing controller for the animation.
(()=>{
 const states=[...document.querySelectorAll('.resume-card--practice,.compact-about__tool-slider')].map(root=>({root,nextAt:0,active:false,held:false}));
 const available=s=>{
  if(s.held||document.hidden||document.body.classList.contains('case-study-open'))return false;
  const desktop=s.root.classList.contains('resume-card--practice');
  if(matchMedia('(min-width:1101px)').matches!==desktop)return false;
  const panel=s.root.closest('.compact-about__panel');if(panel?.hidden||panel?.inert||s.root.inert)return false;
  if(desktop&&parseFloat(s.root.style.opacity||'1')<.72)return false;
  const box=s.root.getBoundingClientRect();return box.width>0&&box.height>0&&box.bottom>innerHeight*.15&&box.top<innerHeight*.85;
 };
 const tick=()=>{const now=performance.now();states.forEach(s=>{
  const active=available(s);
  if(!active){s.active=false;s.nextAt=0;return}
  if(!s.active){s.active=true;s.nextAt=now+3000;return}
  if(now>=s.nextAt){s.nextAt=now+3000;s.root.dispatchEvent(new CustomEvent('portfolio-tool-next'))}
 })};
 states.forEach(s=>{s.root.addEventListener('pointerdown',()=>s.held=true,{passive:true});['pointerup','pointercancel','lostpointercapture'].forEach(type=>s.root.addEventListener(type,()=>s.held=false,{passive:true}))});
 states.forEach(s=>['click','wheel','pointerdown','pointerup','keydown'].forEach(type=>s.root.addEventListener(type,()=>{s.nextAt=performance.now()+3000},{passive:true})));
 addEventListener('scroll',tick,{passive:true});addEventListener('resize',tick,{passive:true});
 document.addEventListener('visibilitychange',()=>{states.forEach(s=>s.active=false);tick()});
 setInterval(tick,100);tick();
})();
