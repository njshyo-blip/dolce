/* Dolce — versão independente. Sem bibliotecas ou serviços externos. */
'use strict';
(() => {
const FLAVORS = [
  ['Baunilha','#f4dfaa'],['Chocolate','#8e5943'],['Morango','#eea2ac'],
  ['Pistache','#b7ca8b'],['Blueberry','#a797c6'],['Menta','#9bcbb3'],
  ['Caramelo','#d6a265'],['Cookies & cream','#e6d9c3'],['Limão','#d6df9b'],
  ['Cereja','#cf7586'],['Manga','#efbc60'],['Lavanda','#bcafd8']
];
const CONES = ['Tradicional','Waffle','Chocolate','Colorida','Copinho'];
const PEOPLE = ['Clara','Bento','Lia','Theo','Amélia','Noah','Rosa','Cecília'];
const UPGRADES = [
  ['Manga',60,1],['Lavanda',90,2],['Cereja no topo',80,2],
  ['Confeitos',110,3],['Novos visitantes',70,2],['Jardim florido',100,3]
];
const SAVE_KEY = 'dolce-standalone-v1';
const blankStats = () => ({score:0,cash:0,correct:0,wrong:0,lost:0,combo:0,best:0});
function initialOrder(){return {cone:1,balls:[2,2,0],top:0,name:'Clara',limit:50};}
function levelOf(stats){return 1+Math.floor(stats.correct/4);}
function generateOrder(level,owned,rng=Math.random){
  const pool=[0,1,2,3,4,5,6,7,8,9,...(owned.includes(0)?[10]:[]),...(owned.includes(1)?[11]:[])];
  const count=Math.min(4,1+Math.floor(rng()*Math.min(4,level+1)));
  const limit=Math.max(22,52-level*3);
  return {cone:Math.floor(rng()*5),balls:Array.from({length:count},()=>pool[Math.floor(rng()*pool.length)]),
    top:level>1&&owned.includes(2)&&rng()<.3?1:level>2&&owned.includes(3)&&rng()<.3?2:0,
    name:PEOPLE[Math.floor(rng()*(owned.includes(4)?8:6))],limit};
}
function evaluateOrder(order,cone,balls,top,wait,previousCombo){
  const exact=cone===order.cone&&top===order.top&&[...balls].sort((a,b)=>a-b).join() === [...order.balls].sort((a,b)=>a-b).join();
  const bonus=Math.round(Math.max(0,Math.min(1,wait/order.limit))*100);
  const combo=exact?previousCombo+1:0;
  const mult=1+Math.min(4,Math.floor(combo/3))*.25;
  return {exact,bonus,combo,mult,points:exact?Math.round((100+bonus)*mult):20,
    cash:exact?Math.round((8+balls.length*3+bonus/20)*mult):2};
}
function formatTime(seconds){const t=Math.ceil(Math.max(0,seconds));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
function cleanSave(raw){return {
  record:Number.isFinite(raw?.record)?Math.max(0,Math.floor(raw.record)):0,
  wallet:Number.isFinite(raw?.wallet)?Math.max(0,Math.floor(raw.wallet)):0,
  owned:Array.isArray(raw?.owned)?[...new Set(raw.owned.filter(n=>Number.isInteger(n)&&n>=0&&n<UPGRADES.length))]:[]
};}
// Exportação apenas para os testes locais de regras. Não exige Node para jogar.
if(typeof module!=='undefined'&&module.exports)module.exports={generateOrder,evaluateOrder,formatTime,cleanSave,initialOrder,levelOf};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);
let state={mode:'ready',time:180,wait:50,stats:blankStats(),cone:null,balls:[],top:0,order:initialOrder(),sound:false,tab:'flavors',loaded:null};
let saved=cleanSave({}),audio=null,gesture=null,toastTimer=null,unique=0,lastTick=performance.now(),returnMode='ready';
try {saved=cleanSave(JSON.parse(localStorage.getItem(SAVE_KEY)||'{}'));}catch{}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(saved));}catch{/* Alguns navegadores bloqueiam armazenamento em file://. */}}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3000);}
function ding(freq=600){if(!state.sound)return;try{audio ||=new (window.AudioContext||window.webkitAudioContext)();void audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=freq;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);o.start();o.stop(audio.currentTime+.2);}catch{}}
function art(cone,balls=[],top=0,mini=false,animate=false){
  const id='waffle-'+(++unique);
  let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 270" class="${mini?'mini':'art'}" role="img" aria-label="${CONES[cone]} com ${balls.length} bolas"><defs><pattern id="${id}" width="19" height="19" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V19M0 0H19" fill="none" stroke="#a8743e" stroke-width="2" opacity=".55"/></pattern></defs><ellipse cx="90" cy="252" rx="48" ry="7" fill="#705544" opacity=".1"/>`;
  if(cone===4)out+='<path d="M44 166L57 235Q90 250 123 235L136 166Z" fill="#eed5cc" stroke="#7c5644" stroke-width="2"/><path d="M52 188H128M56 209H124" stroke="#c16a63" stroke-width="7"/><ellipse cx="90" cy="165" rx="46" ry="10" fill="#fff2da" stroke="#7c5644" stroke-width="2"/>';
  else {
    out+=`<path d="M43 159Q90 147 137 159L94 247Q90 254 86 247Z" fill="${cone===2?'#754536':cone===3?'#dfa8af':'#dcb076'}" stroke="#805638" stroke-width="2"/><path d="M43 159L90 250L137 159Z" fill="url(#${id})"/>`;
    if(cone===1)out+='<path d="M44 158Q90 174 136 158L132 171Q90 185 48 171Z" fill="#eac58d" stroke="#a8743e"/>';
    if(cone===3)for(let i=0;i<8;i++)out+=`<path d="M${64+i%3*17} ${181+Math.floor(i/3)*16}l5 3" stroke="${['#f9e7a9','#8fa9b1','#b85252'][i%3]}" stroke-width="3"/>`;
  }
  balls.forEach((f,i)=>{const y=i*33;out+=`<g class="${animate&&i===balls.length-1?'scoop-new':''}"><path d="M48 ${160-y}C35 ${153-y} 48 ${143-y} 48 ${139-y}C39 ${110-y} 66 ${99-y} 89 ${101-y}C119 ${97-y} 140 ${121-y} 131 ${143-y}C145 ${160-y} 129 ${168-y} 116 ${161-y}Q100 ${171-y} 88 ${163-y}Q71 ${171-y} 63 ${162-y}Q53 ${168-y} 48 ${160-y}Z" fill="${FLAVORS[f][1]}" stroke="#805b47" stroke-width="1.8"/><path d="M59 ${133-y}Q68 ${111-y} 92 ${113-y}" stroke="#fff8e9" opacity=".45" stroke-width="8" stroke-linecap="round" fill="none"/>`;
    for(let j=0;j<(f===7?16:7);j++)out+=`<ellipse cx="${59+j*23%64}" cy="${126+j*11%29-y}" rx="${f===7?2.8:1.5}" ry="${f===7?2:1}" fill="#6d4d3e" opacity="${f===7?.8:.2}"/>`;
    out+='</g>';
  });
  if(top&&balls.length){const y=(balls.length-1)*33;if(top===1)out+=`<path d="M92 ${106-y}q-1 -18 10 -20" stroke="#6f8555" stroke-width="3" fill="none"/><circle cx="90" cy="${104-y}" r="9" fill="#b94f4b" stroke="#805b47"/>`;
    else for(let j=0;j<15;j++)out+=`<path d="M${55+j*17%70} ${124+j*13%25-y}l5 2" stroke="${['#b94f4b','#f9e7a9','#7596a2'][j%3]}" stroke-width="3"/>`;
  }return out+'</svg>';
}
function avatar(n){return `<svg class="avatar" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="${['#e9d3b1','#d4dfc4','#e9caca','#d2dce3'][n%4]}"/><path d="M16 98Q19 65 50 68Q83 68 85 98" fill="${['#b94f4b','#869b74','#c58d6c','#829ba7'][n%4]}"/><path d="M29 51Q19 14 49 13Q85 12 74 58" fill="#79543b"/><ellipse cx="50" cy="48" rx="23" ry="28" fill="${['#f0c6a5','#bd8d6b','#e5b398'][n%3]}"/><path d="M27 36Q38 6 69 28L75 41Q49 39 44 25Q38 39 27 40" fill="#79543b"/><circle cx="42" cy="47" r="1.9" fill="#56392f"/><circle cx="59" cy="47" r="1.9" fill="#56392f"/><path d="M44 59Q51 65 58 58" stroke="#8b4d42" fill="none" stroke-width="2"/><ellipse cx="35" cy="56" rx="5" ry="3" fill="#d99088" opacity=".6"/><ellipse cx="65" cy="56" rx="5" ry="3" fill="#d99088" opacity=".6"/></svg>`;}
function button(text,cls,action){const b=document.createElement('button');b.type='button';b.textContent=text;if(cls)b.className=cls;if(action)b.addEventListener('click',action);return b;}
function ingredient(kind,id,label,html){const b=button(label,'ingredient');b.innerHTML=html+'<span>'+label+'</span>';b.setAttribute('aria-label',(kind==='cone'?'Escolher ':'Adicionar ')+label);b.dataset.kind=kind;b.dataset.id=id;bindIngredient(b,kind,id);return b;}
function buildIngredients(){
  $('cones').replaceChildren(...CONES.map((c,i)=>ingredient('cone',i,c,art(i,[],0,true))));
  $('flavors').replaceChildren(...FLAVORS.map((f,i)=>i>=10&&!saved.owned.includes(i-10)?null:ingredient('ball',i,f[0],`<span class="tub" style="background:${f[1]}">${i===7?'<b>▪ · ▪ · ▪</b>':''}</span>`)).filter(Boolean));
  const no=button('Sem cobertura','',()=>{state.top=0;renderAssembly();});no.dataset.kind='reset-top';
  $('toppings').replaceChildren(no,...[['Cereja',2],['Confeitos',3]].map(([n,owned],i)=>{const b=ingredient('top',i+1,n+(saved.owned.includes(owned)?'':' · bloqueado'),`<span style="font-size:26px">${i===0?'🍒':'✦'}</span>`);b.dataset.owned=owned;return b;}));
}
function renderOrder(){const o=state.order;$('customer-name').textContent=o.name;$('avatar').innerHTML=avatar(PEOPLE.indexOf(o.name));$('reaction').textContent='“Um sorvetinho, por favor!”';$('number').textContent='#'+String(state.stats.correct+state.stats.wrong+state.stats.lost+1).padStart(3,'0');$('order-cone').textContent=CONES[o.cone];$('order-balls').innerHTML=[...new Set(o.balls)].map(f=>`<div class="order-row"><i style="background:${FLAVORS[f][1]}"></i>${o.balls.filter(b=>b===f).length}× ${FLAVORS[f][0]}</div>`).join('');$('order-top').textContent=o.balls.length+' bolas no total · '+['sem cobertura','cereja no topo','confeitos'][o.top];}
function renderAssembly(animate=false){$('ice-cream').innerHTML=state.cone===null?'<div class="empty-art">'+art(1,[2,0])+'</div>':art(state.cone,state.balls,state.top,false,animate);$('assembly-hint').textContent=state.loaded!==null?'Colher pronta: '+FLAVORS[state.loaded][0]+'. Toque na bancada.':state.cone===null?'01 · Pegue uma casquinha abaixo':state.balls.length<state.order.balls.length?`02 · Adicione as bolas (${state.balls.length}/${state.order.balls.length})`:'03 · Confira e entregue seu sorvete';$('checks').innerHTML=`<span>${state.cone!==null?'✓':'○'} Recipiente escolhido</span><span>${state.balls.length===state.order.balls.length?'✓':'○'} ${state.balls.length} de ${state.order.balls.length} bolas</span><span>${state.top===state.order.top?'✓':'○'} ${state.order.top?'Adicional solicitado':'Sem adicionais'}</span>`;renderControls();}
function renderControls(){const active=state.mode==='play';document.querySelectorAll('[data-kind]').forEach(b=>{b.disabled=!active||(b.dataset.owned!==undefined&&!saved.owned.includes(Number(b.dataset.owned)));if(b.dataset.kind==='cone')b.classList.toggle('selected',Number(b.dataset.id)===state.cone);if(b.dataset.kind==='ball')b.classList.toggle('selected',Number(b.dataset.id)===state.loaded);});$('serve').disabled=!active||state.cone===null||!state.balls.length;$('undo').disabled=!active||(!state.balls.length&&!state.top);$('clear').disabled=!active||state.cone===null;$('pause').disabled=state.mode==='ready'||state.mode==='end';$('pause').textContent=state.mode==='pause'?'▶':'Ⅱ';$('pause').setAttribute('aria-label',state.mode==='pause'?'Continuar':'Pausar');}
function renderStats(){const v=state.stats;$('level').textContent=levelOf(v);$('cash').textContent=v.cash.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});$('score').textContent=v.score.toLocaleString('pt-BR');$('combo').textContent=v.combo+' ×'+(1+Math.min(4,Math.floor(v.combo/3))*.25).toFixed(2);$('record').textContent=saved.record.toLocaleString('pt-BR');$('served').textContent=v.correct+' sorrisos servidos';$('satisfaction').textContent='Satisfação: '+(v.correct+v.wrong+v.lost?Math.round(v.correct/(v.correct+v.wrong+v.lost)*100):100)+'%';document.body.classList.toggle('garden',saved.owned.includes(5));renderClock();}
function renderClock(){$('time').textContent=formatTime(state.time);$('wait').textContent=Math.ceil(state.wait)+'s';const percent=100*state.wait/state.order.limit;$('patience-fill').style.width=percent+'%';$('patience-fill').style.background=percent<25?'var(--red)':'var(--sage)';document.querySelector('.meter').setAttribute('aria-valuenow',Math.round(percent));$('mood').textContent=percent>50?'♡ Com muita vontade':percent>25?'Ainda esperando…':'A paciência está acabando!';}
function resetBuild(){state.cone=null;state.balls=[];state.top=0;state.loaded=null;gesture=null;$('drag-ghost').hidden=true;}
function next(){state.order=generateOrder(levelOf(state.stats),saved.owned);state.wait=state.order.limit;resetBuild();renderOrder();renderAssembly();renderStats();}
function start(){state.mode='play';state.time=180;state.wait=50;state.stats=blankStats();state.order=initialOrder();resetBuild();lastTick=performance.now();$('dialog').close();renderOrder();renderAssembly();renderStats();}
function add(kind,id){if(state.mode!=='play')return;if(kind==='cone'){state.cone=id;ding(450);renderAssembly();return;}if(state.cone===null){toast('Escolha uma casquinha ou copinho primeiro.');return;}if(kind==='top'){if(!state.balls.length){toast('Adicione uma bola antes da cobertura.');return;}state.top=id;ding();renderAssembly();return;}if(state.balls.length>=state.order.balls.length){toast('O pedido já tem todas as bolas. Use desfazer para corrigir.');return;}state.balls.push(id);state.loaded=null;ding(550+state.balls.length*100);renderAssembly(true);}
function spoon(f){return `<svg viewBox="0 0 85 100"><path d="M42 40L70 92" stroke="#7c827d" stroke-width="13" stroke-linecap="round"/><ellipse cx="33" cy="34" rx="25" ry="28" fill="#c6c9bf" stroke="#7c827d" stroke-width="2"/><path d="M11 37Q4 12 29 9Q54 4 58 30L56 43Q44 53 34 46Q20 53 11 37" fill="${FLAVORS[f][1]}" stroke="#805b47" stroke-width="1.5"/><path d="M18 25Q22 16 34 17" fill="none" stroke="#fff8e980" stroke-width="5" stroke-linecap="round"/></svg>`;}
function bindIngredient(b,kind,id){
  b.addEventListener('pointerdown',e=>{if(b.disabled||e.button!==0)return;gesture={pointer:e.pointerId,x:e.clientX,y:e.clientY,kind,id,moved:false};b.setPointerCapture(e.pointerId);if(kind==='ball'){$('drag-ghost').innerHTML=spoon(id);$('drag-ghost').style.left=e.clientX+'px';$('drag-ghost').style.top=e.clientY+'px';$('drag-ghost').hidden=false;}});
  b.addEventListener('pointermove',e=>{if(!gesture||gesture.pointer!==e.pointerId)return;gesture.moved ||=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>10;if(kind==='ball'){$('drag-ghost').style.left=e.clientX+'px';$('drag-ghost').style.top=e.clientY+'px';}});
  b.addEventListener('pointerup',e=>{const g=gesture;gesture=null;$('drag-ghost').hidden=true;if(!g||g.pointer!==e.pointerId)return;const r=$('assembly').getBoundingClientRect();const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;if(!g.moved||inside)add(kind,id);});
  b.addEventListener('pointercancel',()=>{gesture=null;$('drag-ghost').hidden=true;});
  b.addEventListener('click',e=>{if(e.detail===0)add(kind,id);});
}
function serve(){if(state.mode!=='play'||state.cone===null||!state.balls.length)return;const v=state.stats,r=evaluateOrder(state.order,state.cone,state.balls,state.top,state.wait,v.combo);v.score+=r.points;v.cash+=r.cash;v.correct+=Number(r.exact);v.wrong+=Number(!r.exact);v.combo=r.combo;v.best=Math.max(v.best,r.combo);saved.wallet+=r.cash;saved.record=Math.max(saved.record,v.score);save();ding(r.exact?880:240);next();toast(r.exact?`Perfeito! +${r.points} pontos · +R$ ${r.cash} · rapidez +${r.bonus}`:'Pedido diferente do cartão · +20 pontos · R$ 2');}
function showModal(html){$('modal').innerHTML=html;if(!$('dialog').open)$('dialog').showModal();}
function pause(){if(state.mode!=='play')return;state.mode='pause';gesture=null;$('drag-ghost').hidden=true;showModal('<small>UMA PAUSA PARA RESPIRAR</small><h2 id="modal-title">Seu sorvete pode esperar.</h2><p>Os cronômetros estão pausados.</p><button class="primary" id="resume">▶ Voltar ao balcão</button>');$('resume').onclick=resume;renderControls();}
function resume(){state.mode='play';lastTick=performance.now();$('dialog').close();renderControls();}
function end(){state.mode='end';saved.record=Math.max(saved.record,state.stats.score);save();gesture=null;$('drag-ghost').hidden=true;const v=state.stats;const rows=[['Clientes atendidos',v.correct+v.wrong],['Pedidos corretos',v.correct],['Pedidos incorretos',v.wrong],['Clientes que saíram',v.lost],['Pontuação final',v.score],['Dinheiro conquistado','R$ '+v.cash],['Maior combo',v.best],['Avaliação','★'.repeat(Math.max(1,Math.min(5,Math.ceil(v.correct/3))))]];showModal('<small>ATÉ O PRÓXIMO DIA DE SOL</small><h2 id="modal-title">Que dia doce!</h2><p>Cada bola é um novo começo.</p><div class="summary">'+rows.map(([k,val])=>'<div><span>'+k+'</span><b>'+val+'</b></div>').join('')+'</div><button class="primary" id="restart">Mais um dia de sorveteria →</button>');$('restart').onclick=start;renderControls();}
function showShop(){returnMode=state.mode;if(state.mode==='play')state.mode='pause';renderControls();drawShop();}
function drawShop(){showModal('<small>UM BALCÃO CADA VEZ MAIS SEU</small><h2 id="modal-title">Pequenas melhorias</h2><p>Seu cofrinho: R$ '+saved.wallet+' · nível atual '+levelOf(state.stats)+'</p><div class="shop-grid" id="shop-grid"></div><p>Compras e recordes ficam salvos neste navegador, quando o armazenamento local está disponível.</p><button id="close-shop">Voltar</button>');UPGRADES.forEach(([name,price,level],i)=>{const item=document.createElement('div'),title=document.createElement('b'),meta=document.createElement('small');title.textContent=name;meta.textContent='Nível '+level+' · R$ '+price;const b=button(saved.owned.includes(i)?'Adquirido':'Desbloquear','',()=>{if(saved.wallet<price||saved.owned.includes(i)||levelOf(state.stats)<level)return;saved.wallet-=price;saved.owned.push(i);save();buildIngredients();renderStats();renderControls();drawShop();ding(950);});b.disabled=saved.owned.includes(i)||saved.wallet<price||levelOf(state.stats)<level;item.append(title,meta,b);$('shop-grid').append(item);});$('close-shop').onclick=()=>{state.mode=returnMode;lastTick=performance.now();$('dialog').close();renderControls();if(state.mode==='ready')welcome();else if(state.mode==='pause'){state.mode='play';pause();}else if(state.mode==='end')end();};}
function welcome(){showModal('<small>BEM-VINDO À SUA SORVETERIA</small>'+art(1,[2,0],1)+'<h2 id="modal-title">A vida pede sorvete.</h2><p>Três minutos de verão, casquinhas crocantes e muitos sorrisos para servir.</p><div class="instructions">01 · Escolha a casquinha do pedido<br>02 · Clique ou arraste cada sabor até a bancada<br>03 · Confira e entregue antes do tempo</div><button class="primary" id="start">Abrir a sorveteria →</button><p><small>Dia de Sorveteria · 3 minutos · mouse, teclado ou toque</small></p>');$('start').onclick=start;}
$('serve').onclick=serve;$('pause').onclick=()=>state.mode==='pause'?resume():pause();$('shop').onclick=showShop;
$('sound').onclick=()=>{state.sound=!state.sound;$('sound').setAttribute('aria-pressed',state.sound);$('sound').textContent=state.sound?'♫ Som ligado':'♫ Som desligado';ding();};
$('undo').onclick=()=>{if(state.mode!=='play')return;if(state.top)state.top=0;else state.balls.pop();state.loaded=null;renderAssembly();};
$('clear').onclick=()=>{if(state.mode!=='play')return;resetBuild();renderAssembly();};
function switchTab(tab){state.tab=tab;$('flavors').hidden=tab!=='flavors';$('toppings').hidden=tab!=='toppings';$('ingredient-title').textContent=tab==='flavors'?'As bolas de sorvete':'O toque final';for(const t of ['flavors','toppings']){$('tab-'+t).classList.toggle('active',tab===t);$('tab-'+t).setAttribute('aria-pressed',tab===t);}}
$('tab-flavors').onclick=()=>switchTab('flavors');$('tab-toppings').onclick=()=>switchTab('toppings');
// Escape pausa a rodada. O diálogo mantém o foco dentro de si usando a API nativa.
$('dialog').addEventListener('cancel',e=>{e.preventDefault();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.mode==='play'){e.preventDefault();pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.mode==='play')pause();});
setInterval(()=>{const now=performance.now(),dt=(now-lastTick)/1000;lastTick=now;if(state.mode!=='play')return;state.time=Math.max(0,state.time-dt);state.wait=Math.max(0,state.wait-dt);if(state.time===0){renderClock();end();return;}if(state.wait===0){state.stats.lost++;state.stats.combo=0;next();toast('O cliente foi embora… Vamos ao próximo!');}renderClock();},100);
buildIngredients();renderOrder();renderAssembly();renderStats();welcome();
})();
