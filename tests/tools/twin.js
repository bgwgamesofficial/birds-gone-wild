// Side-by-side check: runs a game file with a seeded RNG and a normal-height scripted player, prints a trace. Compare two files with diff. See README.md.
const fs=require('fs'),vm=require('vm');const html=fs.readFileSync(process.argv[2],'utf8');
let code=html.match(/<script>\n\(function\(\)\{[\s\S]*?<\/script>/)[0].replace(/^<script>/,'').replace(/<\/script>$/,'');
code=code.replace("reset();showCard('Birds Gone Wild'","window.__T={go:()=>{reset();state='play';speed=SPEED;paused=false;if(typeof cdEnd!=='undefined')cdEnd=0;msg.style.display='none';},st:()=>[state,score,Math.round(wallet*100),level,Math.round(xp),foes.length,foes.map(f=>Math.round(f.y*100)).join('/'),flies.length,Math.round(lifePts),Math.round(y*100)].join(','),fix:()=>{lvlOpen=false;shopOpen=false;pending=0;paused=false;if(typeof cdEnd!=='undefined')cdEnd=0;}};reset();showCard('Birds Gone Wild'");
const f=function(){};const p=new Proxy(f,{get(t,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k==='length'||k==='count')return 0;return p;},apply(){return p;},construct(){return p;},set(){return true;}});
let seed=1;const M=Object.create(Math);const raf=[];const store={};
const sb={THREE:p,document:p,navigator:p,innerWidth:1000,innerHeight:700,devicePixelRatio:1,performance:{now:()=>T},localStorage:{getItem:k=>store[k]===undefined?null:store[k],setItem:(k,v)=>{store[k]=String(v)},removeItem(){},length:0,key:()=>null},requestAnimationFrame:cb=>{raf.push(cb);return 1;},addEventListener:(t,fn)=>{(L[t]=L[t]||[]).push(fn)},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},console,Math:M,JSON,Object,Array,Float32Array,Number,String,Date,AudioContext:undefined};
const L={};let T=1000;sb.window=sb;vm.createContext(sb);vm.runInContext(code,sb);
M.random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};seed=12345;
sb.__T.go();const out=[];const key=c=>(L.keydown||[]).forEach(fn=>fn({code:c,repeat:false,preventDefault(){}}));
for(let i=0;i<20000;i++){T+=16.667;sb.__T.fix();if(sb.__T.st().split(',')[0]!=='play')sb.__T.go();{const st=sb.__T.st().split(',');const yy=+st[st.length-1]/100;if(yy<3+4*Math.sin(i/300)&&i%6===0)key('Space');}const cb=raf.shift();cb&&cb(T);if(i%200===0)out.push(i+':'+sb.__T.st());}
console.log(out.join('\n'));
