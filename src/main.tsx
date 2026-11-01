import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { candies, products, bonuses, targetRotation, phaseAfterPrize, celebrationPrizes, type Item } from './game.mjs';
import './style.css';
import productIcons from './assets/product-icons.png';
import wheelMascot from './assets/wheel-mascot.png';
import { loadCards, saveCard } from './cards';
import { HalloweenAudio, easedRotation } from './audio';
function read<T,>(key:string, fallback:T):T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
function wrapLabel(name: string, limit: number): string[] {
 const lines: string[] = [];
 let line = '';
 for (const word of name.split(' ')) {
  if (line && (line + ' ' + word).length > limit) { lines.push(line); line = ''; }
  if (word.length > limit) {
   if (line) { lines.push(line); line = ''; }
   let rest = word;
   while (rest.length > limit) { lines.push(rest.slice(0, limit - 1) + '–'); rest = rest.slice(limit - 1); }
   line = rest;
  } else { line = line ? line + ' ' + word : word; }
 }
 if (line) lines.push(line);
 return lines;
}
function ProductGlyph({index,size=34,x,y}:{index:number;size?:number;x?:number;y?:number}) {
 return <svg x={x} y={y} width={size} height={size} viewBox={`${index%4*100} ${Math.floor(index/4)*100} 100 100`} overflow="hidden" aria-hidden="true"><image href={productIcons} width="400" height="200" preserveAspectRatio="none"/></svg>;
}
function ItemIcon({item}:{item:Item}) {
 return item.spriteIndex!==undefined?<ProductGlyph index={item.spriteIndex}/>:<span aria-hidden="true">{item.icon}</span>;
}
function Wheel({items,rotation,spinning,duration,onSpin,disabled}:{items:Item[];rotation:number;spinning:boolean;duration:number;onSpin:()=>void;disabled:boolean}) {
 const n=items.length, r=176, c=190;
 return <div className="wheel-wrap"><div className="pointer"/><div className={'wheel-ring '+(spinning?'spinning':'')}><svg viewBox="0 0 380 380" style={{transform:`rotate(${rotation}deg)`,'--spin-duration':`${duration}ms`} as React.CSSProperties} aria-hidden="true">{items.map((item,i)=>{
 const a=i*2*Math.PI/n-Math.PI/2,b=(i+1)*2*Math.PI/n-Math.PI/2,mid=(a+b)/2;
 const d=n===1?undefined:`M ${c} ${c} L ${c+r*Math.cos(a)} ${c+r*Math.sin(a)} A ${r} ${r} 0 ${n===2?0:b-a>Math.PI?1:0} 1 ${c+r*Math.cos(b)} ${c+r*Math.sin(b)} Z`;
 return <g key={i}>{n===1?<circle cx={c} cy={c} r={r} fill={item.color}/>:<path d={d} fill={item.color} stroke="#21162d" strokeWidth="2"/>}<g transform={`translate(${c+125*Math.cos(mid)},${c+125*Math.sin(mid)}) rotate(${(mid*180/Math.PI)+90})`}>
 <>{item.spriteIndex!==undefined?<ProductGlyph index={item.spriteIndex} size={42} x={-21} y={-45}/>:<text textAnchor="middle" y="-8" fontSize={n>12?23:29}>{item.icon}</text>}</>
 {wrapLabel(item.name, n>12?8:n>8?10:12).map((line,lineIndex)=>{
  const fontSize=n>12?8:10, y=16+lineIndex*(fontSize+2);
  const width=n<=2?100:Math.min(100,2*(125-y)*Math.tan(Math.PI/n)*.78);
  const compressed=line.length*fontSize*.6>width;
  return <text key={lineIndex} textAnchor="middle" y={y} className="slice-label" fontSize={fontSize} textLength={compressed?width:undefined} lengthAdjust="spacingAndGlyphs">{line}</text>;
 })}
 </g></g>;
 })}</svg><button type="button" className="wheel-center" onClick={onSpin} disabled={disabled} aria-label={items===bonuses?'Girar a roleta coringa':'Girar a roleta principal'} title="Clique para girar"><img src={wheelMascot} alt="Tamo AON mas fadigado"/></button></div></div>;
}
function App(){
 const [mode,setMode]=useState<'products'|'candies'>(()=>read<string>('halloween-mode','products')==='candies'?'candies':'products');
 const [bonusEnabled,setBonusEnabled]=useState<boolean>(()=>read<boolean>('halloween-bonus-enabled-v2',false)===true);
 const [activeProducts,setActiveProducts]=useState<string[]>(()=>{
  const ids=read<string[]>('halloween-products-cards-v1',products.map(p=>p.id));
  const valid=Array.isArray(ids)?ids.filter(id=>products.some(p=>p.id===id)):[];
  return valid.length?valid:products.map(p=>p.id);
 });
 const [active,setActive]=useState<string[]>(()=>{const ids=read<string[]>('halloween-candies',candies.slice(0,8).map(c=>c.id));return Array.isArray(ids)&&ids.some(id=>candies.some(c=>c.id===id))?ids.filter(id=>candies.some(c=>c.id===id)):candies.slice(0,8).map(c=>c.id)});
 const [settings,setSettings]=useState(false),[sound,setSound]=useState(false),[phase,setPhase]=useState<'candy'|'bonus'|'done'>('candy');
 const [spinning,setSpinning]=useState<'candy'|'bonus'|null>(null),[rot,setRot]=useState({candy:0,bonus:0}),[candy,setCandy]=useState<Item|null>(null),[bonus,setBonus]=useState<Item|null>(null);
 const [durations,setDurations]=useState({candy:4200,bonus:4200});
 const [celebrating,setCelebrating]=useState(false);
 const [cards,setCards]=useState<Record<string,Blob>>({});
 const [cardError,setCardError]=useState('');
 useEffect(()=>{void loadCards().then(setCards).catch(()=>setCardError('Não foi possível carregar os cards salvos neste navegador.'));},[]);
 async function uploadCard(item:Item,file:File){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){setCardError('Escolha um arquivo PNG, JPG ou WebP.');return}
  try{await saveCard(item.id,file);setCards(prev=>({...prev,[item.id]:file}));setCardError('')}catch{setCardError('Não foi possível salvar o card. Verifique o espaço disponível no navegador.')}
 }
 const [firstCandy,setFirstCandy]=useState<Item|null>(null);
 const [history,setHistory]=useState<{name:string;icon:string;bonus:string}[]>(()=>read('halloween-history',[]));
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),audio=useRef<HalloweenAudio|null>(null);
 const motion=useRef({start:0,duration:0,travel:0,slice:0,initial:0});
 const visibleWheel=phase==='candy'||firstCandy||!bonusEnabled?'candy':'bonus';
 const isProducts=mode==='products';
 const catalog=isProducts?products:candies;
 const currentActive=isProducts?activeProducts:active;
 const selected=catalog.filter(c=>currentActive.includes(c.id));
 const noun=isProducts?'destino':'doce';
 useEffect(()=>{if(isProducts)for(const product of products){const image=new Image();image.src=`/cards/${product.number}.png`;}},[isProducts]);
 useEffect(()=>{if(phase==='done'&&isProducts&&candy)setCelebrating(true)},[phase,isProducts,candy]);
 useEffect(()=>{localStorage.setItem('halloween-mode',JSON.stringify(mode));},[mode]);
 useEffect(()=>{localStorage.setItem('halloween-products-cards-v1',JSON.stringify(activeProducts));},[activeProducts]);
 useEffect(()=>{localStorage.setItem('halloween-bonus-enabled-v2',JSON.stringify(bonusEnabled));},[bonusEnabled]);
 useEffect(()=>{localStorage.setItem('halloween-candies',JSON.stringify(active));},[active]);
 useEffect(()=>{localStorage.setItem('halloween-history',JSON.stringify(history));},[history]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);audio.current?.close();},[]);
 useEffect(()=>{if(!settings)return;const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')setSettings(false)};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler)},[settings]);
 function toggleSound(){
  if(sound){void audio.current?.close();audio.current=null;setSound(false);return}
  try{const engine=new HalloweenAudio();audio.current=engine;void engine.enable().then(()=>setSound(true)).catch(()=>{void engine.close();audio.current=null;setSound(false)})}catch{setSound(false)}
 }
 useEffect(()=>{
  if(!sound||!spinning)return;
  let frame=0,last=-1;
  const tick=()=>{
   const m=motion.current,progress=Math.min(1,(performance.now()-m.start)/m.duration);
   const slice=Math.floor((m.initial+easedRotation(progress)*m.travel)/m.slice);
   if(last!==-1&&slice!==last)audio.current?.tick();
   last=slice;if(progress<1)frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[sound,spinning]);
 function spin(which:'candy'|'bonus'){
 if(spinning||phase!==which||(which==='bonus'&&(firstCandy||!bonusEnabled)))return;
 const items=which==='candy'?selected:bonuses;
 const random=new Uint32Array(1);const limit=Math.floor(4294967296/items.length)*items.length;do{crypto.getRandomValues(random)}while(random[0]>=limit);const index=random[0]%items.length,item=items[index];
 const duration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?100:Math.round(6300+Math.random()*8400);
 setDurations(prev=>({...prev,[which]:duration}));
 const target=targetRotation(rot[which],index,items.length);
 motion.current={start:performance.now(),duration,travel:target-rot[which],slice:360/items.length,initial:rot[which]};
 setSpinning(which);setRot(prev=>({...prev,[which]:target}));
 timer.current=setTimeout(()=>{setSpinning(null);audio.current?.reveal();if(which==='candy'){setCandy(item);setBonus(null);setPhase(phaseAfterPrize(!!firstCandy,bonusEnabled));if(!firstCandy&&!bonusEnabled){setHistory(prev=>[{name:item.name,icon:item.icon,bonus:'Sorteio sem coringa'},...prev].slice(0,12))}if(firstCandy){setHistory(prev=>[{name:firstCandy.name+' + '+item.name,icon:'🍬',bonus:'Giro extra concluído'},...prev].slice(0,12))}}else{setBonus(item);setPhase('done');setHistory(prev=>[{name:candy!.name,icon:candy!.icon,bonus:item.name},...prev].slice(0,12));}},duration);
 }
 function reset(){if(spinning)return;setCelebrating(false);setFirstCandy(null);setCandy(null);setBonus(null);setPhase('candy')}
 function nextParticipant(){
  setCelebrating(false);
  if(bonus?.id==='again'&&!firstCandy){setFirstCandy(candy);setCandy(null);setBonus(null);setPhase('candy')}else reset();
 }
 return <><link rel="preload" as="image" href={productIcons}/><link rel="preload" as="image" href={wheelMascot}/><div className="ambient ambient-one"/><div className="ambient ambient-two"/><header><a className="brand" href="#"><span className="brand-icon">🎃</span><span>trick <i>or</i> treat<span className="brand-sub">HALLOWEEN ROULETTE</span></span></a><div className="header-actions"><span className="event-tag"><span/> EDIÇÃO HALLOWEEN</span><button className="icon-button" aria-label={sound?'Desativar trilha e efeitos sonoros':'Ativar trilha assustadora e efeitos de roleta'} aria-pressed={sound} title={sound?'Silenciar trilha e roleta':'Ativar trilha assustadora e som de roleta'} onClick={toggleSound}>{sound?'♫':'♪'}<span className="sound-state">{sound?'ON':'OFF'}</span></button><button className="settings-button" disabled={!!spinning} onClick={()=>{reset();setSettings(true)}}>⚙ <span>Configurações</span></button></div></header>
 <main><section className="intro"><div className="squad-signature"><img src="/nubank.svg" alt="Nubank" width="54" height="30"/><span className="squad-divider" aria-hidden="true"/><span>HALLOWEEN DO <strong>FuFu Squad!</strong></span><span className="squad-spark" aria-hidden="true">✦</span></div><div className="eyebrow">🦇 &nbsp; A SORTE ESTÁ SOLTA</div><h1>Doces ou <em>travessuras?</em></h1><p>Um giro, um doce. Mais um giro… e tudo pode acontecer.</p><div className="intro-bottom"><span className="tiny-star">✦</span> Prepare sua coragem e deixe a sorte escolher. <span className="tiny-star">✦</span></div></section>
 <div className="steps"><span className={phase==='candy'?'current':'complete'}><b>{phase==='candy'?'1':'✓'}</b> {isProducts?'Descubra seu produto':'Descubra seu doce'}</span>{bonusEnabled&&<><div/><span className={phase==='bonus'?'current':phase==='done'?'complete':''}><b>{phase==='done'?'✓':'2'}</b> Teste sua sorte</span></>}<div/><span className={phase==='done'?'current':''}><b>{bonusEnabled?3:2}</b> Aproveite!</span></div>
 <section className="roulette-grid single-wheel">{visibleWheel==='candy'&&<article className={'roulette-card '+(phase==='candy'?'card-active':'')}><div className="card-top"><span className="number">01</span><span className="card-kicker">{isProducts?'A ROLETA DA MÍDIA':'A PARTE MAIS DOCE'}</span><span className="pill">{selected.length} {isProducts?(selected.length===1?'destino':'destinos'):(selected.length===1?'doce':'doces')}</span></div><h2>Qual vai ser o seu {noun}?</h2><p>{isProducts?'Os produtos da mídia entraram no clima de Halloween.':'Todo mundo merece uma gostosura.'}</p><Wheel onSpin={()=>spin('candy')} disabled={phase!=='candy'||!!spinning} duration={durations.candy} items={selected} rotation={rot.candy} spinning={spinning==='candy'}/><button className="spin-button candy-button" disabled={phase!=='candy'||!!spinning} onClick={()=>spin('candy')}>{spinning==='candy'?'A sorte está girando…':candy?`✓ ${isProducts?'Produto':'Doce'} sorteado`:`✦ Girar ${isProducts?'os produtos':'os doces'}`}</button><div className="card-note">{candy?<><ItemIcon item={candy}/> Seu {noun}: <strong>{candy.name}</strong></>:'Sem truques. Só gostosuras. Ou quase.'}</div></article>}
 {visibleWheel==='bonus'&&<article className={'roulette-card bonus-card '+(phase==='bonus'?'card-active':'')}><div className="card-top"><span className="number">02</span><span className="card-kicker">UMA PITADA DE CAOS</span><span className="pill purple">Coringa</span></div><h2>A sorte tem outros planos.</h2><p>Seu doce pode vir com uma surpresa.</p><Wheel onSpin={()=>spin('bonus')} disabled={phase!=='bonus'||!!spinning||!!firstCandy||!bonusEnabled} duration={durations.bonus} items={bonuses} rotation={rot.bonus} spinning={spinning==='bonus'}/><button className="spin-button bonus-button" disabled={phase!=='bonus'||!!spinning} onClick={()=>spin('bonus')}>{firstCandy?'✓ Coringa já utilizada':spinning==='bonus'?'Invocando sua sorte…':phase==='candy'?'♧ Primeiro, sorteie seu doce':phase==='done'?'✓ Travessura revelada':'✦ Girar a sorte'}</button><div className="card-note">{firstCandy?'O giro extra vale apenas mais um doce, sem nova coringa.':'Uma chance em seis de ganhar em dobro. 👀'}</div></article>}</section>
 <section className={'result '+(candy?'has-result':'')} aria-live="polite" aria-atomic="true"><div className="result-icon">{bonus?bonus.icon:candy?<ItemIcon item={candy}/>:'🔮'}</div><div><span className="result-label">{bonus?'O VEREDITO DO ALÉM':candy?'BOA ESCOLHA, UNIVERSO':'SEU DESTINO APARECE AQUI'}</span><h3>{firstCandy?(candy?`Dois ${isProducts?'produtos':'doces'}, sorte em dobro!`:`Seu primeiro ${noun} está garantido!`):bonus?bonus.name:candy?candy.name:'Uma gostosura está esperando por você.'}</h3><p>{firstCandy?(candy?`Participação encerrada! Confira os dois ${isProducts?'produtos':'doces'} sorteados.`:`Gire a roleta de ${isProducts?'produtos':'doces'} uma última vez. Não há nova rodada coringa.`):(bonus?.description||(candy?(bonusEnabled?'Agora gire a roleta coringa para revelar sua surpresa.':'Participação encerrada! Seu resultado está garantido.'):'Gire a primeira roleta para começar a brincadeira.'))}</p>{firstCandy&&<p className="prize"><ItemIcon item={firstCandy}/> {firstCandy.name}{candy&&<> + <ItemIcon item={candy}/> {candy.name}</>}</p>}{bonus&&<p className="prize">{bonus.id==='double'?'2 × ':''}{candy&&<ItemIcon item={candy}/>} {candy?.name}{bonus.id==='swap'?' → escolha o seu favorito!':''}</p>}</div>{phase==='done'&&<button className="new-round" onClick={nextParticipant}>{bonus?.id==='again'&&!firstCandy?'Usar meu giro extra ↻':'Próximo participante →'}</button>}</section>
 {bonusEnabled&&<section className="rules"><div className="section-label">O QUE O ALÉM RESERVA <span>AS CARTAS DA SORTE</span></div><div className="rules-grid">{[...new Map(bonuses.map(b=>[b.id,b])).values()].map((b,i)=><div className="rule" key={b.id}><span className={'rule-icon rule-'+i}>{b.icon}</span><div><h4>{b.name} <small>{(bonuses.filter(option=>option.id===b.id).length/bonuses.length*100).toLocaleString('pt-BR',{maximumFractionDigits:1})}%</small></h4><p>{['Um segundo doce, sem nova coringa.','Escolha o seu doce favorito.','Seu doce já está garantido.','Duas gostosuras de uma vez.'][i]}</p></div></div>)}</div></section>}
 {history.length>0&&<section className="history"><div className="section-label">RASTROS DA NOITE <button onClick={()=>setHistory([])}>Limpar histórico</button></div><div className="history-list">{history.map((h,i)=><div key={i}><span>{products.some(p=>p.name===h.name)?<ItemIcon item={products.find(p=>p.name===h.name)!}/>:h.icon}</span><strong>{h.name}</strong><small>{h.bonus}</small></div>)}</div></section>}
 <section className="easter"><div className="little-ghost">👻</div><div><strong>Até os mais sombrios têm um lado doce.</strong><p><span title="Wandinha e sua banda sinistra">🖤 🎻 🕷️</span> &nbsp; A Wandinha trouxe a trilha. <span title="Duo e Lily estão de olho">🦉 💜</span> Duo e Lily vieram pelos doces.</p></div><span className="nu" title="Uma brincadeira para o time Nubank">nu<span>HALLOWEEN</span></span></section></main><footer><span>Feito de doces, sustos e um pouquinho de sorte.</span><span>Feliz Halloween <span>✦</span> 2026</span></footer>
 {phase==='done'&&isProducts&&<button className="review-card" onClick={()=>setCelebrating(true)}>🎉 Ver meu prêmio</button>}
 {celebrating&&candy&&<Celebration entries={celebrationPrizes(firstCandy,candy,bonus?.id)} cards={cards} bonus={bonus} close={()=>setCelebrating(false)} next={nextParticipant}/>}
 {settings&&<div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)setSettings(false)}}><Settings cards={cards} uploadCard={uploadCard} cardError={cardError} mode={mode} setMode={setMode} bonusEnabled={bonusEnabled} setBonusEnabled={setBonusEnabled} catalog={catalog} active={currentActive} setActive={isProducts?setActiveProducts:setActive} close={()=>{setSettings(false);reset()}}/></div>}</>;
}
function PrizeCard({item,quantity,file}:{item:Item;quantity:number;file?:Blob}){
 const [url,setUrl]=useState<string>(),[failed,setFailed]=useState(false);
 useEffect(()=>{setFailed(false);if(!file){setUrl(undefined);return}const objectUrl=URL.createObjectURL(file);setUrl(objectUrl);return()=>URL.revokeObjectURL(objectUrl)},[file,item.id]);
 return <figure className="prize-card">{!failed?<img src={url||`/cards/${item.number}.png`} alt={`Card ${item.number}: ${item.name}. ${item.description} Prêmio: ${item.prize}`} onError={()=>setFailed(true)} width="372" height="500"/>:<div className="prize-card-fallback"><span className="prize-number">{item.number}</span><h3>{item.name}</h3><div className="prize-divider"/><p>{item.description}</p><div className="prize-art"><ItemIcon item={item}/></div><strong>{item.prize}</strong></div>}<figcaption>{quantity===2?'✨ Em dobro: 2 unidades!':item.prize}</figcaption></figure>;
}
function Celebration({entries,cards,bonus,close,next}:{entries:{item:Item;quantity:number}[];cards:Record<string,Blob>;bonus:Item|null;close:()=>void;next:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement;const element=dialog.current;element?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{element?.close();document.body.style.overflow=overflow;previous?.focus()}},[]);
 return <dialog ref={dialog} className="celebration" aria-labelledby="celebration-title" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}><div className="celebration-body"><button autoFocus className="icon-button celebration-close" onClick={close} aria-label="Fechar celebração">×</button><div className="confetti" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{'--i':i} as React.CSSProperties}/>)}</div><span className="eyebrow">✦ O FUFU SQUAD CELEBRA VOCÊ ✦</span><h2 id="celebration-title">Você mandou bem! 🎉</h2><p className="celebration-subtitle">Seu destino foi revelado. Hora de adoçar essa conquista!</p>{bonus&&<p className="celebration-bonus">{bonus.icon} {bonus.name}{bonus.id==='swap'?' — escolha o doce de sua preferência.':bonus.id==='again'?' — seu primeiro prêmio está garantido!':''}</p>}<div className="prize-cards">{entries.map((entry,index)=><PrizeCard key={`${entry.item.id}-${index}`} {...entry} file={cards[entry.item.id]}/>)}</div><button className="spin-button" onClick={next}>{bonus?.id==='again'?'Usar meu giro extra ↻':'Próximo participante →'}</button><button className="celebration-back" onClick={close}>Voltar ao resultado</button></div></dialog>;
}
function Settings({active,setActive,close,mode,setMode,bonusEnabled,setBonusEnabled,catalog,cards,uploadCard,cardError}:{cards:Record<string,Blob>;uploadCard:(item:Item,file:File)=>Promise<void>;cardError:string;active:string[];setActive:React.Dispatch<React.SetStateAction<string[]>>;close:()=>void;mode:'products'|'candies';setMode:React.Dispatch<React.SetStateAction<'products'|'candies'>>;bonusEnabled:boolean;setBonusEnabled:React.Dispatch<React.SetStateAction<boolean>>;catalog:Item[]}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement;root.current?.querySelector('button')?.focus();return()=>previous?.focus()},[]);
 return <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" ref={root} onKeyDown={e=>{if(e.key==='Tab'){const controls=root.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)');if(!controls?.length)return;const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}}><div className="modal-head"><div><span className="eyebrow">DO SEU JEITO</span><h2 id="settings-title">Configure a brincadeira</h2></div><button className="icon-button" aria-label="Fechar configurações" onClick={close}>×</button></div><div className="mode-selector" role="group" aria-label="Tipo de roleta"><button aria-pressed={mode==='products'} onClick={()=>setMode('products')}>📊 Produtos <small>A roleta da mídia</small></button><button aria-pressed={mode==='candies'} onClick={()=>setMode('candies')}>🍬 Doces <small>As gostosuras de sempre</small></button></div><label className="bonus-toggle"><span><strong>Roleta coringa</strong><small>Uma segunda roleta com surpresas e giro extra.</small></span><input type="checkbox" checked={bonusEnabled} onChange={e=>setBonusEnabled(e.target.checked)}/></label><p>Ative as opções disponíveis. A roleta se ajusta automaticamente. Mantenha pelo menos uma ativa.</p><div className="candy-options">{catalog.map(c=><label key={c.id} style={{'--candy-color':c.color} as React.CSSProperties}><ItemIcon item={c}/><strong>{c.name}</strong><input type="checkbox" checked={active.includes(c.id)} disabled={active.length===1&&active.includes(c.id)} onChange={()=>setActive(prev=>prev.includes(c.id)?prev.filter(id=>id!==c.id):[...prev,c.id])}/></label>)}</div>{mode==='products'&&<section className="card-uploads"><h3>Cards de prêmio</h3><p>Associe a arte original a cada destino. Os arquivos ficam salvos neste navegador.</p>{products.map(item=><label key={item.id}><span>{item.number}. {item.name}<small>{cards[item.id]?'✓ Card salvo':'PNG, JPG ou WebP'}</small></span><input aria-label={`Card ${item.number}: ${item.name}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)void uploadCard(item,file);e.target.value=''}}/></label>)}{cardError&&<p role="alert">{cardError}</p>}</section>}<div className="modal-foot"><span>{active.length} de {catalog.length} {mode==='products'?'produtos':'doces'} ativos</span><button className="spin-button" onClick={close}>Pronto, vamos girar!</button></div></div>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
