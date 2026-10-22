export interface Skin {
  id: string; name: string; description: string; background: string; grid: string;
  snakeHead: string; snakeBody: string; snakeGlow: string; food: string; foodGlow: string;
}
export const SKINS: Skin[] = [
  { id:'synthwave', name:'Synthwave', description:'Rejilla cian y serpiente magenta', background:'#150233', grid:'rgba(0,255,255,.18)', snakeHead:'#ff00ff', snakeBody:'#9900cc', snakeGlow:'rgba(255,0,255,.55)', food:'#ffb800', foodGlow:'rgba(255,184,0,.65)' },
  { id:'matrix', name:'Matrix', description:'Verde neón sobre negro profundo', background:'#03120b', grid:'rgba(32,255,105,.15)', snakeHead:'#b6ff00', snakeBody:'#00aa55', snakeGlow:'rgba(0,255,100,.5)', food:'#ff3d55', foodGlow:'rgba(255,61,85,.6)' },
  { id:'ocean', name:'Ocean', description:'Tonos aqua en una noche azul', background:'#031a2b', grid:'rgba(37,218,255,.16)', snakeHead:'#65fff2', snakeBody:'#168bba', snakeGlow:'rgba(37,218,255,.5)', food:'#ffcc66', foodGlow:'rgba(255,204,102,.6)' },
  { id:'fire', name:'Fire', description:'Naranja vivo y rojo volcánico', background:'#210a10', grid:'rgba(255,105,54,.16)', snakeHead:'#ffe36b', snakeBody:'#ff5b35', snakeGlow:'rgba(255,74,31,.5)', food:'#73fbd3', foodGlow:'rgba(115,251,211,.6)' },
];
