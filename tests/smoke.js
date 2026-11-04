const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
let code=html.match(/<script>\n\(function\(\)\{[\s\S]*?<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
code=code.replace("reset();showCard('Birds Gone Wild'","window.__fn={renderSettings,applyAll,applyRes,applyShadows,applyAniso,presetMatch,capFps,modeCap,spawnFoe:()=>spawnFoe(-60,3,.8),setMode:(m)=>{mode=m;applyMode();reset();},getFoes:()=>foes.length,spawnFly,getFlies:()=>flies.length,flyAtBird:()=>{y=2;vy=0;spawnFly();const f=flies[flies.length-1];f.x=f.dir*.3;f.y=y;},setLife:v=>{lifePts=v;state='play';ghost=0;paused=false;hold=false;},getLife:()=>lifePts,ghostFall:()=>{state='play';paused=false;hold=false;ghost=gt+5;y=BOT+.6;vy=-13;},getY:()=>y,BOT,die};window.__dbg=()=>({state,score,wallet,level,foes:foes.length,pipes:pipes.length,revives});reset();showCard('Birds Gone Wild'");
const f=function(){};
const p=new Proxy(f,{get(t,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k==='length'||k==='count')return 0;return p;},apply(){return p;},construct(){return p;},set(){return true;}});
const listeners={};const raf=[];
const sb={THREE:p,document:p,navigator:p,innerWidth:1000,innerHeight:700,devicePixelRatio:1,performance,
 localStorage:{getItem:()=>null,setItem(){}},
 requestAnimationFrame:cb=>{raf.push(cb);return 1;},
 addEventListener:(t,fn)=>{(listeners[t]=listeners[t]||[]).push(fn);},
 setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},console,Math,JSON,Object,Array,Float32Array,Number,String,Date,
 AudioContext:undefined,webkitAudioContext:undefined};
sb.window=sb;
vm.createContext(sb);
let errs=[];
try{vm.runInContext(code,sb);}catch(e){console.log('INIT ERROR:',e.stack.split('\n').slice(0,4).join('\n'));process.exit(1);}
const key=c=>(listeners.keydown||[]).forEach(fn=>fn({code:c,repeat:false,preventDefault(){}}));
let t=1000,states={};
for(let i=0;i<4000;i++){
  t+=16;
  if(i%22===0)key('Space');
  const cb=raf.shift();
  try{cb&&cb(t);}catch(e){errs.push('frame '+i+': '+e.stack.split('\n').slice(0,3).join(' | '));break;}
}
console.log(JSON.stringify(sb.__dbg()));
const F=sb.__fn;for(const k of ['renderSettings','applyAll','applyRes','applyShadows','applyAniso','presetMatch','capFps','modeCap']){try{F[k]();}catch(e){errs.push('FN ERROR '+k+': '+e.message);}}
for(const m of [1,2,3,4,5]){try{F.setMode(m);F.spawnFoe();for(let i=0;i<300;i++){t+=16;if(i%20===0)key('Space');const cb=raf.shift();cb&&cb(t);}}catch(e){errs.push('MODE '+m+' ERROR: '+e.stack.split('\n').slice(0,3).join(' | '));}}
console.log('modes ok, foes:',F.getFoes());
// Mode 5 butterflies + life bar: spawn and fly, then check a full life segment saves the player from one crash.
try{F.setMode(5);F.spawnFly();for(let i=0;i<300;i++){t+=16;if(i%20===0)key('Space');const cb=raf.shift();cb&&cb(t);}
 F.setLife(0);const n0=F.getFlies();F.flyAtBird();for(let i=0;i<6&&F.getLife()===0;i++){const cb=raf.shift();t+=16;cb&&cb(t);} // a few frames: the frame limiter may skip one
 if(F.getLife()!==20||F.getFlies()!==n0)errs.push('LIFE: touching a butterfly did not add life (life '+F.getLife()+')');
 F.setLife(100);F.die();
 if(F.getLife()!==0||sb.__dbg().state==='dead')errs.push('LIFE: a full segment did not save the player (state '+sb.__dbg().state+', life '+F.getLife()+')');
 else console.log('butterflies ok, flies:',F.getFlies(),'- catching adds life, a full segment saved the player');}
catch(e){errs.push('BUTTERFLY ERROR: '+e.stack.split('\n').slice(0,3).join(' | '));}
// The toucan must never fall below the ground, even while a crash is blocked (ghost time after shield/life/revive).
for(const m of [2,5]){try{F.setMode(m);F.ghostFall();let lo=99;for(let i=0;i<120;i++){t+=16;const cb=raf.shift();cb&&cb(t);lo=Math.min(lo,F.getY());}
 if(lo<F.BOT+.5-1e-6)errs.push('GROUND: mode '+m+' toucan fell to y='+lo.toFixed(2)+' (ground limit '+(F.BOT+.5)+')');else console.log('ground ok in mode',m,'- lowest y',lo.toFixed(2));}
 catch(e){errs.push('GROUND TEST ERROR: '+e.message);}}
console.log(errs.length?errs.join('\n'):'NO RUNTIME ERRORS in 4000 simulated frames');
if(errs.length)process.exit(1);
