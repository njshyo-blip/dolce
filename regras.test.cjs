'use strict';
const assert=require('node:assert/strict');
const {generateOrder,evaluateOrder,formatTime,cleanSave,initialOrder,levelOf}=require('../game.js');
const first=initialOrder();
const perfect=evaluateOrder(first,1,[2,0,2],0,50,2);
assert.equal(perfect.exact,true);assert.equal(perfect.combo,3);assert.equal(perfect.mult,1.25);assert.equal(perfect.points,250);
assert.equal(evaluateOrder(first,1,[2,0],0,50,0).exact,false);
assert.equal(evaluateOrder(first,0,[2,2,0],0,50,4).combo,0);
assert.equal(evaluateOrder(first,1,[2,2,0],1,50,0).exact,false);
assert.equal(evaluateOrder(first,1,[2,2,0],0,50,0).cash,22);
assert.equal(evaluateOrder(first,1,[2,2,0],0,0,0).points,100);
assert.equal(formatTime(179.9),'3:00');assert.equal(formatTime(179),'2:59');assert.equal(formatTime(0),'0:00');
assert.deepEqual(cleanSave({record:-4,wallet:'bad',owned:[0,0,6,-1,2.1,3]}),{record:0,wallet:0,owned:[0,3]});
assert.equal(levelOf({correct:8}),3);
for(let level=1;level<=20;level++)for(let i=0;i<100;i++){
 const o=generateOrder(level,[]);assert(o.balls.length>=1&&o.balls.length<=4);assert(o.balls.every(n=>n>=0&&n<10));assert.equal(o.top,0);assert(o.cone>=0&&o.cone<5);assert(o.limit>=22);
 const unlocked=generateOrder(level,[0,1,2,3,4,5]);assert(unlocked.balls.every(n=>n>=0&&n<12));assert([0,1,2].includes(unlocked.top));
}
// RNG determinístico verifica que Lavanda pode ser pedida sem liberar Manga.
assert.deepEqual(generateOrder(3,[1],()=>.999).balls,[11,11,11,11]);
console.log('OK: precisão, coberturas, combos, rapidez, dinheiro, cronômetro, saves, níveis e 4.000 pedidos gerados.');
