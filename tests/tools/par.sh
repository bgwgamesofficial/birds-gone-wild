#!/bin/bash
# Runs 4 simulated-player processes in parallel (one per CPU core) and merges the results.
# usage: tests/tools/par.sh <index.html> <runsEach> <skill 0..1>
# prints: median level reached, and the share of runs that cleared each level.
D=$(dirname "$0"); T=$(mktemp -d)
for i in 1 2 3 4; do node "$D/bot.js" "$1" "$2" "$3" 1 > "$T/par$i.out" 2>/dev/null & done; wait
cat "$T"/par?.out | grep -o 'list: .*' | sed 's/list: //' | tr ',' '\n' | node -e "
const a=require('fs').readFileSync(0,'utf8').trim().split('\n').map(s=>parseInt(s));const R=a.length;
const rows=[2,3,5,8,10,12,15,18,20,22,25,28,30,35,40,45,50];
console.log('runs',R,'median death level',a.sort((x,y)=>x-y)[Math.floor(R/2)],'| deaths:',a.join(','));
console.log(rows.map(l=>'L'+l+':'+Math.round(a.filter(x=>x>l).length/R*100)+'%').join(' '));"
rm -rf "$T"
