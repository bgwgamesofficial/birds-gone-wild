const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
let code=html.match(/<script>\n\(function\(\)\{[\s\S]*?<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
code=code.replace("function foeHit(f){","function foeHit(f){if(gt>=ghost)window.__hits=(window.__hits||0)+1;");
code=code.replace("reset();showCard('Birds Gone Wild'","window.__fn={rich:()=>{wallet=500;level=7;perks.wings=2;inv.shield=3;},runState:()=>({wallet,level,wings:perks.wings,shield:inv.shield}),game:b=>{BR=b;loadProg();},infXp:()=>{BR=false;level=1;xp=0;lvlOpen=false;state='play';gainXp(500);const r={level,lvlOpen};lvlOpen=false;shopOpen=false;paused=false;return r;},camp:(l)=>{level=l;reset();state='play';speed=SPEED;paused=false;cdEnd=0;window.__hits=0;},pin:(yy)=>{y=yy;vy=0;wallet=1e9;lifePts=0;lvlOpen=false;shopOpen=false;paused=false;cdEnd=0;state='play';},act:()=>hawksActive(),cap:()=>lvMaxActive(),ceil:()=>CEIL,bestReset:()=>{best=42;resetBest();return best;},uturn:()=>{level=12;lvProg=0;state='play';paused=false;cdEnd=0;lvlOpen=false;shopOpen=false;foes.forEach(q=>scene.remove(q.g));foes.length=0;spawnFoe(-(sp()+4)*2.4,10,.5);const f=foes[foes.length-1];f.kind='hunter';f.wantRet=true;f.turnX=7;f.y=10;return f;},keepSafe:()=>{ghost=gt+99;y=-3;vy=0;lifePts=0;hawkT=99;flyT=99;},prog:()=>lvProg,lvl:{get:()=>({level,lvProg,lvlOpen,paused,cd:cdEnd,need:lvNeed(),type:lvType(),ds:(()=>{const l=level,a=[];for(let i=1;i<=50;i++){level=i;a.push(lvD());}level=l;return a;})()}),set:(l,h)=>{level=l;lvProg=h;state='play';paused=false;cdEnd=0;lvlOpen=false;shopOpen=false;},pass:()=>lvAdd(),over:()=>gameOver(),boss:()=>{spawnBoss();return foes[foes.length-1].kind;}},start:()=>startGame(),pause:()=>pauseGame(),resume:()=>resumeGame(),toStart:()=>restartGame(),renderSettings,applyAll,applyRes,applyShadows,applyAniso,presetMatch,capFps,modeCap,spawnFoe:()=>spawnFoe(-60,3,.8),setMode:(m)=>{mode=m;applyMode();reset();},getFoes:()=>foes.length,spawnFly,getFlies:()=>flies.length,flyAtBird:()=>{y=2;vy=0;spawnFly();const f=flies[flies.length-1];f.x=f.dir*.3;f.y=y;},setLife:v=>{lifePts=v;state='play';ghost=0;paused=false;hold=false;},getLife:()=>lifePts,ghostFall:()=>{state='play';paused=false;hold=false;ghost=gt+5;y=BOT+.6;vy=-13;},getY:()=>y,BOT,die};window.__dbg=()=>({cd:cdEnd,paused,mode,state,score,wallet,level,foes:foes.length,pipes:pipes.length,revives});reset();showCard('Birds Gone Wild'");
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
  if(i%22===0){if(sb.__dbg().state==='ready')sb.__fn.start();else key('Space');}
  const cb=raf.shift();
  try{cb&&cb(t);}catch(e){errs.push('frame '+i+': '+e.stack.split('\n').slice(0,3).join(' | '));break;}
}
console.log(JSON.stringify(sb.__dbg()));
const F=sb.__fn;
// Start rules: Space/taps must NOT start the game from the start screen; Start runs a 3-second countdown first.
try{F.setMode(5);F.toStart();
 const s0=sb.__dbg().state;key('Space');for(let i=0;i<10;i++){t+=16;const cb=raf.shift();cb&&cb(t);}
 if(s0==='ready'&&sb.__dbg().state!=='ready')errs.push('START: Space started the game from the start screen');
 const fr=n=>{for(let i=0;i<n;i++){t+=16;const cb=raf.shift();cb&&cb(t);}},d=()=>sb.__dbg();
 F.start();fr(60);
 if(!(d().paused&&d().cd))errs.push('START: game began before the 3-second countdown finished');
 F.pause();fr(5);if(d().cd||!d().paused)errs.push('START: pause did not work during the countdown');
 fr(250);if(!d().paused)errs.push('START: game un-paused by itself after pausing during the countdown');
 F.resume();fr(60);if(!(d().paused&&d().cd))errs.push('START: resume did not restart the countdown');
 for(let i=0;i<260&&d().cd;i++)fr(1);fr(2);if(d().paused||d().state!=='play')errs.push('START: game did not begin after the countdown (paused='+d().paused+', state='+d().state+')');
 else console.log('start ok: only Start begins the game, 3-second countdown, pause works during the countdown');}
catch(e){errs.push('START TEST ERROR: '+e.message);}for(const k of ['renderSettings','applyAll','applyRes','applyShadows','applyAniso','presetMatch','capFps','modeCap']){try{F[k]();}catch(e){errs.push('FN ERROR '+k+': '+e.message);}}
for(const m of [1,2,3,4,5]){try{F.setMode(m);F.spawnFoe();for(let i=0;i<300;i++){t+=16;if(i%20===0){if(sb.__dbg().state==='ready')F.start();else key('Space');}const cb=raf.shift();cb&&cb(t);}}catch(e){errs.push('MODE '+m+' ERROR: '+e.stack.split('\n').slice(0,3).join(' | '));}}
console.log('modes ok, foes:',F.getFoes());
// Infinite Run (default): XP levels as in the live game.
try{const r=F.infXp();if(!(r.level>1&&r.lvlOpen))errs.push('INFINITE: XP did not level up / open the upgrade flow '+JSON.stringify(r));else console.log('infinite run ok: XP levels up and opens upgrades');}catch(e){errs.push('INFINITE TEST ERROR: '+e.message);}
// Infinite Run: a bird riding the ceiling must still get hit (anti-camping).
try{F.camp(1);sb.__hits=0;for(let i=0;i<2400;i++){F.pin(F.ceil());t+=16;const cb=raf.shift();cb&&cb(t);}
 if(!(sb.__hits>5))errs.push('INFINITE: a bird riding the ceiling for 40 s was hit only '+(sb.__hits||0)+' times');else console.log('infinite anti-camping ok: ceiling camper hit '+sb.__hits+' times in 40 s');}
catch(e){errs.push('INFINITE CAMP TEST ERROR: '+e.message);}
// Everything below tests Boss Run.
F.game(true);
// Every new game starts from nothing ($0, level 1, no upgrades/items), in both modes; game over resets everything.
try{for(const b of [false,true]){F.game(b);F.toStart();F.rich();F.start();const r=F.runState();
  if(r.wallet!==0||r.level!==1||r.wings!==0||r.shield!==0)errs.push('FRESH: '+(b?'Boss':'Infinite')+' Run did not start from nothing '+JSON.stringify(r));
  F.rich();F.lvl.over();const g=F.runState();if(g.wallet!==0||g.level!==1||g.wings!==0)errs.push('FRESH: '+(b?'Boss':'Infinite')+' Run game over did not reset everything '+JSON.stringify(g));}
 if(!errs.some(e=>e.startsWith('FRESH')))console.log('fresh start ok: new games and game over reset wallet, level, upgrades and items (both modes)');}
catch(e){errs.push('FRESH TEST ERROR: '+e.message);}
F.game(true);
// Mode 5 butterflies + life bar: spawn and fly, then check a full life segment saves the player from one crash.
try{F.setMode(5);F.spawnFly();for(let i=0;i<300;i++){t+=16;if(i%20===0)key('Space');const cb=raf.shift();cb&&cb(t);}
 F.setLife(0);const n0=F.getFlies();F.flyAtBird();for(let i=0;i<6&&F.getLife()===0;i++){const cb=raf.shift();t+=16;cb&&cb(t);} // a few frames: the frame limiter may skip one
 if(F.getLife()!==12.5||F.getFlies()!==n0)errs.push('LIFE: touching a butterfly did not add life (life '+F.getLife()+')');
 F.setLife(100);F.die();
 if(F.getLife()!==0||sb.__dbg().state==='dead')errs.push('LIFE: a full segment did not save the player (state '+sb.__dbg().state+', life '+F.getLife()+')');
 else console.log('butterflies ok, flies:',F.getFlies(),'- catching adds life, a full segment saved the player');}
catch(e){errs.push('BUTTERFLY ERROR: '+e.stack.split('\n').slice(0,3).join(' | '));}
// The toucan must never fall below the ground, even while a crash is blocked (ghost time after shield/life/revive).
for(const m of [2,5]){try{F.setMode(m);F.ghostFall();let lo=99;for(let i=0;i<120;i++){t+=16;const cb=raf.shift();cb&&cb(t);lo=Math.min(lo,F.getY());}
 if(lo<F.BOT+.5-1e-6)errs.push('GROUND: mode '+m+' toucan fell to y='+lo.toFixed(2)+' (ground limit '+(F.BOT+.5)+')');else console.log('ground ok in mode',m,'- lowest y',lo.toFixed(2));}
 catch(e){errs.push('GROUND TEST ERROR: '+e.message);}}
// Levels: short varied levels, difficulty within 0..1 and mostly rising, finishing a level, shop every 5 levels, game over keeps the level.
try{const L=F.lvl;F.setMode(5);const g=L.get(),ds=g.ds;
 if(ds[0]>.1||ds[49]<.6||ds[49]>1||ds.some(v=>v<0||v>1))errs.push('LEVELS: difficulty out of range '+ds[0]+'..'+ds[49]);
 if(!(ds[48]>ds[20]&&ds[20]>ds[5]))errs.push('LEVELS: difficulty does not rise overall');
 L.set(3,0);const n3=L.get().need;L.set(3,n3-1);L.pass();let q=L.get();
 if(q.level!==4||q.lvProg!==0||q.lvlOpen||!q.cd)errs.push('LEVELS: finishing level 3 should go straight to a countdown into level 4 '+JSON.stringify(q).slice(0,120));
 L.set(5,0);if(L.get().type!=='fly')errs.push('LEVELS: level 5 should be a butterfly level');L.set(5,L.get().need-1);L.pass();q=L.get();
 if(q.level!==6||!q.lvlOpen)errs.push('LEVELS: finishing level 5 should open the marketplace/upgrade flow');
 L.set(10,0);if(L.get().type!=='boss'||L.boss()!=='boss')errs.push('LEVELS: level 10 should be a boss level with the Hawk Chief');
 L.set(4,7);L.over();q=L.get();if(q.level!==1||q.lvProg!==0)errs.push('LEVELS: game over should send you back to level 1 '+JSON.stringify(q).slice(0,120));
 if(F.bestReset()!==0)errs.push('SETTINGS: reset best score did not clear the best score');
 if(!errs.some(e=>e.startsWith('LEVELS')))console.log('levels ok: types, difficulty curve, finishing levels, shop every 5, game over back to level 1, reset best works');}
catch(e){errs.push('LEVELS TEST ERROR: '+e.message);}
// Smart hawks: a hawk that misses can U-turn and come back once; it is counted only once.
try{F.setMode(5);const h=F.uturn(),d0=h.dir;let turned=false,back=false;
 for(let i=0;i<900;i++){F.keepSafe();t+=16;const cb=raf.shift();cb&&cb(t);if(h.ret)turned=true;if(turned&&h.dir*h.x>0)back=true;if(back&&h.dir*h.x<-1)break;}
 if(!turned||h.dir===d0)errs.push('HAWKS: hawk did not turn around after missing');
 else if(!back)errs.push('HAWKS: turned hawk did not come back toward the player');
 else if(F.prog()!==1)errs.push('HAWKS: returning hawk was counted '+F.prog()+' times (should be 1)');
 else console.log('smart hawks ok: a missed hawk turns around, comes back, counted once');}
catch(e){errs.push('HAWK TEST ERROR: '+e.message);}
// 3-hawk rule and anti-camping: never more than 3 hawks coming at once; riding the ceiling still gets you hit.
try{let mx=0;for(const L of [1,12,30,48,50]){F.camp(L);const cap=F.cap();let m=0;for(let i=0;i<2400;i++){F.pin(i%400<200?2:11);t+=16;const cb=raf.shift();cb&&cb(t);m=Math.max(m,F.act());}mx=Math.max(mx,m);
  if(m>cap)errs.push('HAWKS: level '+L+' had '+m+' hawks coming at once (its limit is '+cap+')');}
 if(mx>5)errs.push('HAWKS: '+mx+' hawks came at the player at once (the rule is 5)');
 F.camp(20);for(let i=0;i<2400;i++){F.pin(F.ceil());t+=16;const cb=raf.shift();cb&&cb(t);}
 if(!(sb.__hits>0))errs.push('HAWKS: a bird riding the ceiling for 40 s was never hit');
 else console.log('hawk rule ok (most at once '+mx+', limit grows 1..5 by level), ceiling camper hit '+sb.__hits+' times in 40 s');}
catch(e){errs.push('3-HAWK TEST ERROR: '+e.message);}
console.log(errs.length?errs.join('\n'):'NO RUNTIME ERRORS in 4000 simulated frames');
if(errs.length)process.exit(1);
