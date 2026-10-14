// Decorative background is shared by Hero and About. Interactive nodes stay intact.
(() => {
 const hero=document.querySelector('.portal-hero');
 const original=hero?.querySelector('.portal-art');
 const resume=document.querySelector('.portal-resume');
 if(!original)return;
 const backdrop=document.createElement('div');backdrop.className='portal-backdrop';backdrop.setAttribute('aria-hidden','true');
 const heroLayer=original.querySelector('.portal-stage');heroLayer.classList.add('portal-stage--hero');
 // The creative is a separate layer, clipped by the same soft portal mask.
 const dimensions={'14-114':[614,1230],'14-115':[486,1004],'14-116':[755,1169]};
 const portalDepth={'14-114':.64,'14-115':.84,'14-116':.72};
 const decorationDepth={'16-189':.85,'16-187':.58,'16-188':.72};
 const parallaxItems=[];
 [heroLayer].forEach(layer=>layer.querySelectorAll(':scope > img').forEach(image=>{
  const id=image.getAttribute('src').match(/(\d+-\d+)(?:-lossless)?\.(?:png|webp)/)?.[1];
  if(id==='16-222')image.classList.add('portal-hero-glow');
  if(dimensions[id]){
   const group=document.createElement('div');group.className='portal-group';group.style.cssText=image.style.cssText;
   group.style.aspectRatio=dimensions[id].join(' / ');
   image.replaceWith(group);group.append(image);
   image.style.cssText='';image.className='portal-base';
   const isHero=layer===heroLayer;
   if(isHero){
    const baseSrc='assets/portals/parallax-base-'+id+'-lossless.webp?v=performance-1';image.src=baseSrc;
    const mask=document.createElement('div');mask.className='portal-creative-mask';const alpha=window.portalMasks?.[id];
    if(alpha){mask.style.maskImage='url("'+alpha+'")';mask.style.webkitMaskImage='url("'+alpha+'")';}
    // Mask belongs to the portal group and has no independent animation.

    const creative=document.createElement('img');creative.className='portal-creative';creative.alt='';creative.src='assets/portals/parallax-image-'+id+'-lossless.webp?v=performance-1';
    mask.append(creative);group.append(mask);parallaxItems.push({node:creative,depth:1.05,range:14});
   }
   parallaxItems.push({node:group,depth:portalDepth[id],range:62});
  }else if(decorationDepth[id]){parallaxItems.push({node:image,depth:decorationDepth[id],range:92});}
 }));
 backdrop.append(heroLayer);document.body.prepend(backdrop);original.remove();
 const portrait=resume?.querySelector('.resume-card--identity .resume-portrait-group');
 if(portrait)portrait.innerHTML='<div class="figma-portrait-composition"><div class="figma-portrait-base"></div><div class="figma-portrait-silhouette"><img src="assets/portals/about-portrait-current-lossless.webp?v=about-photo-3" alt="Портрет Даши"></div></div>';
 const compactFrame=document.querySelector('#about-panel-0 .compact-about__portrait-frame');
 if(compactFrame){
  const photo=compactFrame.querySelector('.compact-about__portrait');
  if(photo){
   const silhouette=document.createElement('div');silhouette.className='compact-about__photo-silhouette';
   silhouette.append(photo);compactFrame.append(silhouette);
   const fit=()=>{
    const w=compactFrame.clientWidth,h=compactFrame.clientHeight;
    if(!w||!h)return;
    const radius=matchMedia('(max-width:600px)').matches?14:22;
    const overhang=Math.min(64,w*.3),upper=Math.min(64,h*.2);
    const shoulder=h*.52,join=h*.67;
    // One continuous outline, with a curved return to the rounded lower frame.
    const outline=`M ${-overhang} ${-upper} H ${w} V ${h-radius} Q ${w} ${h} ${w-radius} ${h} H ${radius} Q 0 ${h} 0 ${h-radius} V ${join} C 0 ${shoulder} ${-overhang} ${shoulder} ${-overhang} ${shoulder-overhang*.3} Z`;
    silhouette.style.clipPath=`path("${outline}")`;
   };
   const photoObserver=new ResizeObserver(fit);photoObserver.observe(compactFrame);photo.addEventListener('load',fit);addEventListener('resize',fit,{passive:true});fit();
  }
 }
 document.querySelector('.portal-down')?.addEventListener('click',event=>{
  event.preventDefault();document.querySelector(matchMedia('(min-width:1101px)').matches?'#resume':'#about-mobile')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 });
 const arrow=document.querySelector('.portal-down');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const clamp=value=>Math.max(0,Math.min(1,value));
 const smooth=value=>value*value*(3-2*value);
 const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
 const pointer={x:0,y:0,tx:0,ty:0,clientX:0,clientY:0,engaged:false};
 parallaxItems.forEach((item,index)=>{item.x=0;item.y=0;item.tilt=0;item.rx=0;item.ry=0;item.phase=index*1.37;item.period=17+(index%5)*2.3;item.anchor=item.node.closest('.portal-group')||item.node;item.isCreative=item.node.classList.contains('portal-creative');item.isGroup=item.node.classList.contains('portal-group');item.hero=item.node.closest('.portal-stage--hero')===heroLayer;});
 const masks=[...heroLayer.querySelectorAll('.portal-creative-mask,.portal-hero-glow')];
 const bases=[...heroLayer.querySelectorAll('.portal-base,.portal-asset:not(.portal-hero-glow)')];
 const work=document.querySelector('#work'),compactAbout=document.querySelector('#about-mobile');
 let geometryDirty=true;
 const setStyle=(node,key,value)=>{if(node.style[key]!==value)node.style[key]=value};
 heroLayer.style.opacity='1';bases.forEach(base=>base.style.opacity='1');
 // Different slow ellipses combine upward, lateral and inward movement.
 const idleMotion=(seconds,phase,period,amplitude)=>({
  x:amplitude*(Math.sin(seconds*2*Math.PI/period+phase)*.72+Math.sin(seconds*2*Math.PI/(period*1.6)+phase*.7)*.28),
  y:amplitude*(Math.cos(seconds*2*Math.PI/(period*1.22)+phase)*.8+Math.sin(seconds*2*Math.PI/(period*1.8)+phase)*.2)
 });
 let idleClock=0,idleWeight=0;
 let pending=0,lastTime=0,currentFade=null,currentScale=null;
 const update=now=>{
  pending=0;
  const about=matchMedia('(min-width:1101px)').matches?resume:compactAbout;
  const bottom=work?.getBoundingClientRect().top??0;
  backdrop.hidden=bottom<=0;
  const heroBox=hero.getBoundingClientRect();
  if(geometryDirty){parallaxItems.forEach(item=>{const a=item.anchor;item.centerX=a.offsetLeft+a.offsetWidth/2;item.centerY=a.offsetTop+a.offsetHeight/2});geometryDirty=false;}
  const aboutTop=about?.getBoundingClientRect().top??innerHeight;
  const fadeTarget=smooth(clamp((innerHeight*.95-aboutTop)/(innerHeight*.75)));
  // A reciprocal quadratic curve has a rounded peak and long, gentle tails.
  const arrowCenter=heroBox.top+(arrow?.offsetTop??0)+(arrow?.offsetHeight??0)/2;
  const distance=(arrowCenter-innerHeight*.62)/(innerHeight*.34);
  const scaleTarget=reduced.matches?1:.9+.42/(1+3*distance*distance);
  const dt=lastTime?Math.min(Math.max(now-lastTime,0),64):16;
  const follow=reduced.matches?1:1-Math.exp(-dt/120);
  if(currentFade===null){currentFade=fadeTarget;currentScale=scaleTarget;}
  currentFade+=(fadeTarget-currentFade)*follow;
  currentScale+=(scaleTarget-currentScale)*follow;
  // Portals are persistent; only the creative inside each matching mask fades.
  heroLayer.style.opacity='1';
  masks.forEach(mask=>setStyle(mask,'opacity',String(1-currentFade)));
  bases.forEach(base=>{
   base.style.opacity='1';
   setStyle(base,'filter','brightness('+(1+.06*currentFade).toFixed(3)+') saturate('+(1-.1*currentFade).toFixed(3)+')');
  });
  arrow?.style.setProperty('--arrow-scale',String(currentScale));
  backdrop.style.clipPath='inset(0 0 '+Math.max(0,innerHeight-bottom)+'px 0)';
  const heroVisible=heroBox.bottom>0;
  const idleActive=!reduced.matches&&!document.hidden&&!backdrop.hidden&&!document.body.classList.contains('case-study-open')&&heroVisible&&currentFade<.995;
  if(idleActive)idleClock+=dt/1000;
  const idleTarget=idleActive?1:0;
  idleWeight+=(idleTarget-idleWeight)*(reduced.matches?1:1-Math.exp(-dt/1200));
  const active=finePointer.matches&&!reduced.matches&&!backdrop.hidden&&!document.hidden&&!document.body.classList.contains('case-study-open');
  if(!active){pointer.tx=0;pointer.ty=0;}
  const pointerFollow=reduced.matches?1:1-Math.exp(-dt/220);
  pointer.x+=(pointer.tx-pointer.x)*pointerFollow;pointer.y+=(pointer.ty-pointer.y)*pointerFollow;
  let parallaxMoving=false;
  const sceneScale=Math.max(.5,Math.min(1.35,innerWidth/1440));
  parallaxItems.forEach(item=>{
   const {node,depth,range}=item;

   // Resting coordinates avoid feedback from an element's animated transform.
   const centerX=innerWidth/2+(item.centerX-720)*sceneScale;
   const centerY=(item.centerY)*sceneScale;
   const dx=pointer.clientX-centerX,dy=pointer.clientY-centerY;
   const reach=Math.max(420,innerWidth*.55);
   const proximity=1/(1+(dx*dx+dy*dy)/(reach*reach));
   const localX=Math.max(-1,Math.min(1,dx/(innerWidth*.35)));
   const localY=Math.max(-1,Math.min(1,dy/(innerHeight*.5)));
   const enabled=active&&pointer.engaged;
   const isCreative=item.isCreative;
   const motionSign=isCreative?-1:1;
   const motionStrength=.75*.8*1.25*(isCreative?1.5625:1);
   const tx=enabled?(pointer.tx*.6+localX*proximity*.7)*range*depth*motionStrength*motionSign:0;
   const ty=enabled?(pointer.ty*.5+localY*proximity*.65)*range*depth*.7*motionStrength*motionSign:0;
   const tilt=enabled?localX*proximity*(isCreative?.55:1.15)*depth*motionStrength*motionSign:0;
   const returnTime=1250;
   const followTime=enabled?(isCreative?280:380):returnTime;
   const easing=reduced.matches?1:1-Math.exp(-dt/followTime);
   item.x+=(tx-item.x)*easing;item.y+=(ty-item.y)*easing;item.tilt+=(tilt-item.tilt)*easing;
   const weight=item.hero?idleWeight*(1-currentFade):0;
   const drift=idleMotion(idleClock,item.phase,item.period,isCreative?2.2:item.isGroup?9:11);
   node.style.translate=(item.x+drift.x*weight).toFixed(3)+'px '+(item.y+drift.y*weight).toFixed(3)+'px';
   node.style.rotate=(item.tilt+Math.sin(idleClock*.22+item.phase)*.35*weight).toFixed(3)+'deg';
   // Tilt the whole portal group, so its base and image mask remain one plane.
   const hasDepth=item.hero&&!isCreative;
   const rx=hasDepth?((enabled?-localY*proximity*2.75*(1-currentFade):0)+Math.sin(idleClock*.19+item.phase)*.45*weight):0;
   const ry=hasDepth?((enabled?localX*proximity*3.5*(1-currentFade):0)+Math.cos(idleClock*.17+item.phase)*.6*weight):0;
   item.rx+=(rx-item.rx)*easing;item.ry+=(ry-item.ry)*easing;
   node.style.transform=hasDepth&&!reduced.matches?'perspective(1100px) rotateX('+item.rx.toFixed(3)+'deg) rotateY('+item.ry.toFixed(3)+'deg)':'none';
   if(Math.abs(rx-item.rx)>.003||Math.abs(ry-item.ry)>.003)parallaxMoving=true;
   if(Math.abs(tx-item.x)>.03||Math.abs(ty-item.y)>.03||Math.abs(tilt-item.tilt)>.003)parallaxMoving=true;
  });
  lastTime=now;
  if(!document.hidden&&(idleActive||Math.abs(idleTarget-idleWeight)>.0005||Math.abs(fadeTarget-currentFade)>.0005||Math.abs(scaleTarget-currentScale)>.0005||Math.abs(pointer.tx-pointer.x)>.0005||Math.abs(pointer.ty-pointer.y)>.0005||parallaxMoving))queue();
 };
 const queue=()=>{if(!pending)pending=requestAnimationFrame(update)};
 reduced.addEventListener('change',queue);
 window.addEventListener('pointermove',event=>{
  if(!finePointer.matches||reduced.matches||event.pointerType==='touch')return;
  pointer.clientX=event.clientX;pointer.clientY=event.clientY;pointer.engaged=true;
  pointer.tx=Math.max(-1,Math.min(1,event.clientX/innerWidth*2-1));
  pointer.ty=Math.max(-1,Math.min(1,event.clientY/innerHeight*2-1));queue();
 },{passive:true});
 const resetPointer=()=>{pointer.tx=0;pointer.ty=0;pointer.engaged=false;queue()};
 document.documentElement.addEventListener('pointerleave',resetPointer);
 window.addEventListener('blur',resetPointer);
 finePointer.addEventListener('change',resetPointer);
 document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden)resetPointer();else queue()});
 const resize=()=>{geometryDirty=true;document.body.style.setProperty('--portal-scale',String(Math.max(.5,Math.min(1.35,window.innerWidth/1440))));queue()};
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',resize,{passive:true});
 new ResizeObserver(()=>{geometryDirty=true;queue()}).observe(heroLayer);
 heroLayer.addEventListener('load',()=>{geometryDirty=true;queue()},true);
 resize();
})();
