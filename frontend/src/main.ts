import './style.css';
import { SnakeEngine } from './gameEngine';
import { CanvasRenderer } from './renderer';
import { SoundManager } from './soundManager';
import { SKINS } from './skins';
import { api, type TrafficStats } from './network';
import type { DirectionName } from './types';
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=$('game-board') as HTMLCanvasElement,scoreEl=$('score'),bestEl=$('best-score'),levelEl=$('level'),overlay=$('game-overlay'),overlayKicker=$('overlay-kicker'),overlayTitle=$('overlay-title'),overlayCopy=$('overlay-copy'),startButton=$('start-button') as HTMLButtonElement,pauseButton=$('pause-button') as HTMLButtonElement,statusBadge=$('server-status');
const sound=new SoundManager();
const savedSkin=localStorage.getItem('cybersnake_skin');
let skinIndex=Math.max(0,SKINS.findIndex(skin=>skin.id===savedSkin));
const renderer=new CanvasRenderer(canvas,20,SKINS[skinIndex]);
let accumulator=0,previousFrame=0,savingResult=false;
const playerName=localStorage.getItem('cybersnake_player')||`Pilot-${Math.floor(100+Math.random()*900)}`;
const engine=new SnakeEngine({
 onScore:(score,level)=>{scoreEl.textContent=String(score);levelEl.textContent=String(level);bestEl.textContent=String(engine.bestScore);},
 onEat:()=>sound.playEat(),onHit:()=>sound.playHit(),
 onGameOver:(score,level,duration)=>{void finishGame(score,level,duration);},
});
bestEl.textContent=String(engine.bestScore);
function applySkin(){const skin=SKINS[skinIndex];renderer.setSkin(skin);$('skin-name').textContent=skin.name;$('skin-description').textContent=skin.description;document.documentElement.style.setProperty('--skin-bg',skin.background);document.documentElement.style.setProperty('--skin-head',skin.snakeHead);localStorage.setItem('cybersnake_skin',skin.id);}
function changeSkin(delta:number){skinIndex=(skinIndex+delta+SKINS.length)%SKINS.length;applySkin();}
function updateSoundButton(){const button=$('sound-toggle');button.textContent=sound.muted?'SONIDO: OFF':'SONIDO: ON';button.setAttribute('aria-label',sound.muted?'Activar sonidos':'Silenciar sonidos');}
function setOverlay(kicker:string,title:string,copy:string,button:string){overlayKicker.textContent=kicker;overlayTitle.textContent=title;overlayCopy.textContent=copy;startButton.textContent=button;overlay.classList.remove('hidden');}
function hideOverlay(){overlay.classList.add('hidden');}
function updatePauseButton(){const paused=engine.state==='paused';pauseButton.textContent=paused?'▶':'Ⅱ';pauseButton.setAttribute('aria-label',paused?'Continuar juego':'Pausar juego');}
function startGame(){if(engine.state==='ready'||engine.state==='over'){engine.start();savingResult=false;void api.startGame(playerName).then(refreshTraffic).catch(()=>setServerStatus(false));}else if(engine.state==='paused')engine.start();hideOverlay();updatePauseButton();previousFrame=performance.now();}
function pauseGame(){if(engine.state!=='playing')return;engine.pause();setOverlay('PAUSA','Partida pausada','Cuando quieras seguir, vuelve al juego.','CONTINUAR');updatePauseButton();}
function togglePause(){if(engine.state==='playing')pauseGame();else if(engine.state==='paused')startGame();}
function restartGame(){engine.reset();accumulator=0;savingResult=false;setOverlay('LISTO CUANDO TÚ LO ESTÉS','¿Jugamos?','Come los orbes, crece y evita chocar con las paredes o contigo mismo.','EMPEZAR');updatePauseButton();}
async function finishGame(score:number,level:number,duration:number){setOverlay('FIN DE PARTIDA','¡Buen intento!',`Puntuación: ${score} · Récord: ${engine.bestScore}`, 'JUGAR OTRA VEZ');updatePauseButton();if(savingResult)return;savingResult=true;try{await api.recordGame(playerName,score,level,duration);await Promise.all([refreshTraffic(),refreshLeaderboard()]);}catch{overlayCopy.textContent=`Puntuación: ${score} · Récord: ${engine.bestScore}. No se pudo guardar en el servidor.`;}}
function setServerStatus(online:boolean){statusBadge.classList.toggle('offline',!online);statusBadge.querySelector('span')!.textContent=online?'Servidor online':'Servidor offline';}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));}
function formatBytes(bytes:number){return bytes<1024?`${bytes} B`:`${(bytes/1024).toFixed(1)} KB`;}
async function refreshTraffic(){try{const data:TrafficStats=await api.traffic();setServerStatus(true);$('request-count').textContent=String(data.total_http_requests);$('kpi-requests').textContent=String(data.total_http_requests);$('kpi-started').textContent=String(data.games_started);$('kpi-finished').textContent=String(data.games_finished);$('kpi-bytes').textContent=formatBytes(data.bytes_transferred);$('traffic-log').innerHTML=data.recent_requests.length?data.recent_requests.map(row=>`<tr><td>${escapeHtml(row.timestamp)}</td><td>${escapeHtml(row.method)}</td><td><code>${escapeHtml(row.endpoint)}</code></td><td>${row.status_code}</td><td>${row.duration_ms} ms</td></tr>`).join(''):'<tr><td colspan="5" class="empty-row">Sin peticiones registradas.</td></tr>';}catch{setServerStatus(false);}}
async function refreshLeaderboard(){try{const entries=await api.leaderboard();$('leaderboard-list').innerHTML=entries.length?entries.map((entry,index)=>`<li><span>#${index+1} · ${escapeHtml(entry.player_name)}</span><strong>${entry.score} pts</strong></li>`).join(''):'<li class="empty-row">Aún no hay partidas guardadas.</li>';}catch{$('leaderboard-list').innerHTML='<li class="empty-row">No se pudo cargar el ranking.</li>';}}
function chooseDirection(direction:DirectionName){if(engine.state==='ready')startGame();engine.setDirection(direction);}
startButton.addEventListener('click',startGame);pauseButton.addEventListener('click',togglePause);$('restart-button').addEventListener('click',restartGame);$('traffic-refresh').addEventListener('click',refreshTraffic);$('traffic-open').addEventListener('click',()=>{void refreshTraffic();document.querySelector('.server-panel')?.scrollIntoView({behavior:'smooth',block:'start'});});$('leaderboard-refresh').addEventListener('click',refreshLeaderboard);
$('skin-prev').addEventListener('click',()=>changeSkin(-1));$('skin-next').addEventListener('click',()=>changeSkin(1));$('sound-toggle').addEventListener('click',()=>{sound.toggle();updateSoundButton();});
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button=>button.addEventListener('pointerdown',event=>{event.preventDefault();chooseDirection(button.dataset.direction as DirectionName);}));
document.addEventListener('keydown',event=>{const keys:Record<string,DirectionName>={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};if(keys[event.code]){event.preventDefault();chooseDirection(keys[event.code]);}else if(event.code==='Space'||event.code==='KeyP'){event.preventDefault();if(engine.state==='ready'||engine.state==='over')startGame();else togglePause();}});
let touchStart:{x:number;y:number}|null=null;canvas.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touchStart={x:event.clientX,y:event.clientY};});canvas.addEventListener('pointerup',event=>{if(!touchStart||event.pointerType!=='touch')return;const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;if(Math.max(Math.abs(dx),Math.abs(dy))>24)chooseDirection(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));touchStart=null;});
function frame(timestamp:number){if(!previousFrame)previousFrame=timestamp;const delta=Math.min(timestamp-previousFrame,100);previousFrame=timestamp;if(engine.state==='playing'){accumulator+=delta;if(accumulator>=engine.getTickDuration()){accumulator-=engine.getTickDuration();engine.tick();}}renderer.render(engine,timestamp);requestAnimationFrame(frame);}
applySkin();updateSoundButton();void api.health().then(()=>setServerStatus(true)).catch(()=>setServerStatus(false));void refreshTraffic();void refreshLeaderboard();window.setInterval(()=>{void refreshTraffic();},3000);requestAnimationFrame(frame);

