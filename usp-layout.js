// Keep the arrow and following sections clear of the vertical USP list.
(() => {
 const hero=document.querySelector('.portal-hero'),list=hero?.querySelector('.hero-highlights');if(!list)return;
 const layout=()=>{
  const mobile=matchMedia('(max-width:650px)').matches;
  const baseline=mobile?788:907;
  const arrowTop=Math.max(baseline,list.offsetTop+list.offsetHeight+56);
  hero.style.setProperty('--usp-arrow-top',arrowTop+'px');
  hero.style.setProperty('--usp-hero-height',Math.max(mobile?830:980,arrowTop+80)+'px');
 };
 new ResizeObserver(layout).observe(list);window.addEventListener('resize',layout,{passive:true});
 document.fonts?.ready.then(layout);layout();
})();
