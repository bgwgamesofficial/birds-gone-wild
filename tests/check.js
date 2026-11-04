// Syntax check: extracts the game script from index.html and parses it.
const fs=require('fs'),path=require('path'),vm=require('vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/<script>\n\(function\(\)\{[\s\S]*?<\/script>/);
if(!m){console.error('Game script not found in index.html');process.exit(1);}
try{new vm.Script(m[0].replace(/^<script>/,'').replace(/<\/script>$/,''));console.log('SYNTAX OK');}
catch(e){console.error('SYNTAX ERROR:',e.message);process.exit(1);}
