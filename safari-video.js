(() => {
 const appleWebKit=/AppleWebKit/.test(navigator.userAgent)&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Safari/.test(navigator.userAgent)&&!/Chrome|Chromium|Edg|Android/.test(navigator.userAgent)));
 if(!appleWebKit)return;
 document.documentElement.classList.add('is-apple-webkit');
 const sources={
  'credit-user-4567-alpha.webm':'assets/videos/credit-user-4567-safari.mp4',
  'credit-case-hero.webm':'assets/videos/credit-case-hero-safari.mp4',
  'credit-cards-diods.webm':'assets/videos/credit-cards-diods-safari.mp4',
  'mortgage-user-keyed-1080p.webm':'assets/videos/mortgage-user-keyed-1080p-safari.mp4',
  'mortgage-motion-shield-alpha.webm':'assets/videos/mortgage-motion-shield-safari.mp4',
  'insurance-user-keyed-1080p.webm':'assets/videos/insurance-user-keyed-1080p-safari.mp4'
 };
 const frames=new WeakMap();
 window.portfolioVideoFrame=video=>frames.get(video)?.draw();
 document.querySelectorAll('video').forEach(video=>{
  if(video.classList.contains('case__video-fade'))return;
  const original=video.querySelector('source')?.getAttribute('src');
  const source=sources[original?.split('/').pop()];if(!source)return;
  const canvas=document.createElement('canvas');
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:false});
  if(!gl)return;
  const shader=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
  const program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p; varying vec2 uv; void main(){uv=vec2((p.x+1.0)*0.5,(1.0-p.y)*0.5);gl_Position=vec4(p,0,1);}'));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; uniform sampler2D tex; varying vec2 uv; void main(){vec3 c=texture2D(tex,vec2(uv.x*0.5,uv.y)).rgb;float a=texture2D(tex,vec2(0.5+uv.x*0.5,uv.y)).r;gl_FragColor=vec4(c*a,a);}'));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
  [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR));
  [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE));
  const card=video.closest('.cases .case');
  if(!card){canvas.className='safari-video-surface';canvas.setAttribute('aria-hidden','true');video.after(canvas);video.style.setProperty('visibility','hidden','important')}
  const layout=()=>{
   if(card)return;
   const s=getComputedStyle(video);
   const motion=video.classList.contains('case-motion__video');
   const active=!motion||video.classList.contains('is-active');
   Object.assign(canvas.style,{position:'absolute',pointerEvents:'none',left:video.offsetLeft+'px',top:video.offsetTop+'px',width:video.offsetWidth+'px',height:video.offsetHeight+'px',transform:s.transform,transformOrigin:s.transformOrigin,opacity:motion?(active?'1':'0'):s.opacity,objectFit:s.objectFit,objectPosition:s.objectPosition,zIndex:s.zIndex,mixBlendMode:'normal',visibility:active?'visible':'hidden'});
  };
  layout();
  let lastTime=-1;
  const draw=()=>{
   if(video.readyState<2||!video.videoWidth||gl.isContextLost())return canvas;
   const w=video.videoWidth/2,h=video.videoHeight;
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);lastTime=-1}
   if(lastTime!==video.currentTime){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);lastTime=video.currentTime}
   layout();return canvas;
  };
  frames.set(video,{draw});
  let pending=0;
  const tick=()=>{pending=0;draw();if(!video.paused&&!video.ended)pending=video.requestVideoFrameCallback?video.requestVideoFrameCallback(tick):requestAnimationFrame(tick)};
  video.addEventListener('play',()=>{if(!pending)tick()});
  ['loadeddata','seeked','pause','ended'].forEach(event=>video.addEventListener(event,draw));
  new ResizeObserver(layout).observe(video);new MutationObserver(layout).observe(video,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',layout,{passive:true});
  video.src=source;video.muted=true;video.playsInline=true;video.load();
 });
})();
