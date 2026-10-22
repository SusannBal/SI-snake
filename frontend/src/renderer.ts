import type { SnakeEngine } from './gameEngine';
import type { Skin } from './skins';
export class CanvasRenderer {
  private context: CanvasRenderingContext2D; private canvas: HTMLCanvasElement; private cellSize: number; private skin: Skin;
  constructor(canvas:HTMLCanvasElement,gridSize:number,skin:Skin){this.canvas=canvas;this.context=canvas.getContext('2d')!;this.cellSize=canvas.width/gridSize;this.skin=skin;}
  public setSkin(skin:Skin){this.skin=skin;}
  public render(engine:SnakeEngine,timestamp:number){const ctx=this.context,size=this.cellSize;ctx.clearRect(0,0,this.canvas.width,this.canvas.height);ctx.fillStyle=this.skin.background;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);ctx.strokeStyle=this.skin.grid;ctx.lineWidth=1;for(let i=0;i<=engine.gridSize;i++){const p=i*size+.5;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,this.canvas.height);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(this.canvas.width,p);ctx.stroke();}if(engine.food){const pulse=1+Math.sin(timestamp/130)*.08;ctx.save();ctx.shadowColor=this.skin.food;ctx.shadowBlur=20;ctx.fillStyle=this.skin.food;ctx.beginPath();ctx.arc((engine.food.x+.5)*size,(engine.food.y+.5)*size,size*.28*pulse,0,Math.PI*2);ctx.fill();ctx.restore();}engine.snake.forEach((segment,index)=>{const inset=index===0?2:3;ctx.save();ctx.fillStyle=index===0?this.skin.snakeHead:this.skin.snakeBody;ctx.shadowColor=this.skin.snakeGlow;ctx.shadowBlur=index===0?17:8;ctx.beginPath();ctx.roundRect(segment.x*size+inset,segment.y*size+inset,size-inset*2,size-inset*2,6);ctx.fill();ctx.restore();});}
}
