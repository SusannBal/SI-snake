import type { DirectionName, EngineCallbacks, Point } from './types';
export type EngineState = 'ready' | 'playing' | 'paused' | 'over';
const GRID_SIZE = 20;
const BEST_KEY = 'cybersnake_best_score';
const VECTOR: Record<DirectionName, Point> = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
export class SnakeEngine {
  public readonly gridSize = GRID_SIZE;
  public snake: Point[] = [];
  public food: Point | null = null;
  public score = 0;
  public level = 1;
  public bestScore = 0;
  public state: EngineState = 'ready';
  private direction: Point = VECTOR.right;
  private nextDirection: Point = VECTOR.right;
  private turnQueued = false;
  private startedAt = 0;
  private callbacks: EngineCallbacks;
  constructor(callbacks: EngineCallbacks = {}) { this.callbacks = callbacks; this.bestScore = this.readBestScore(); this.reset(false); }
  public reset(notify = true) {
    this.snake = [{x:9,y:10},{x:8,y:10},{x:7,y:10}]; this.direction = VECTOR.right; this.nextDirection = VECTOR.right;
    this.turnQueued = false; this.score = 0; this.level = 1; this.food = null; this.placeFood(); this.state = 'ready'; if (notify) this.callbacks.onScore?.(this.score,this.level);
  }
  public start() { if (this.state === 'playing') return; if (this.state === 'over') this.reset(); if (this.state === 'ready') this.startedAt = Date.now(); this.state = 'playing'; }
  public pause() { if (this.state === 'playing') this.state = 'paused'; }
  public setDirection(name: DirectionName) { const vector = VECTOR[name]; if (this.state !== 'playing' || this.turnQueued) return; if (vector.x === -this.direction.x && vector.y === -this.direction.y) return; this.nextDirection = vector; this.turnQueued = true; }
  public getTickDuration() { return Math.max(65,155-(this.level-1)*9); }
  public tick() {
    if (this.state !== 'playing') return;
    this.direction = this.nextDirection; this.turnQueued = false;
    const head = {x:this.snake[0].x+this.direction.x,y:this.snake[0].y+this.direction.y};
    const eating = !!this.food && head.x === this.food.x && head.y === this.food.y;
    const body = eating ? this.snake : this.snake.slice(0,-1);
    if (head.x<0||head.x>=GRID_SIZE||head.y<0||head.y>=GRID_SIZE||body.some(part=>part.x===head.x&&part.y===head.y)) { this.callbacks.onHit?.(); this.finish(); return; }
    this.snake.unshift(head);
    if(eating){this.callbacks.onEat?.();this.score+=10;this.level=Math.floor(this.score/50)+1;this.placeFood();this.callbacks.onScore?.(this.score,this.level);if(!this.food)this.finish();}else this.snake.pop();
  }
  private placeFood(){const free:Point[]=[];for(let y=0;y<GRID_SIZE;y++)for(let x=0;x<GRID_SIZE;x++)if(!this.snake.some(part=>part.x===x&&part.y===y))free.push({x,y});this.food=free.length?free[Math.floor(Math.random()*free.length)]:null;}
  private finish(){if(this.state==='over')return;this.state='over';if(this.score>this.bestScore){this.bestScore=this.score;try{localStorage.setItem(BEST_KEY,String(this.bestScore));}catch{/* El récord permanece durante esta sesión. */}}this.callbacks.onScore?.(this.score,this.level);this.callbacks.onGameOver?.(this.score,this.level,Math.max(0,Math.floor((Date.now()-this.startedAt)/1000)));}
  private readBestScore(){try{return Number(localStorage.getItem(BEST_KEY))||0;}catch{return 0;}}
}



