export type DirectionName = 'up' | 'down' | 'left' | 'right';
export interface Point { x: number; y: number; }
export interface EngineCallbacks { onScore?: (score: number, level: number) => void; onEat?: () => void; onHit?: () => void; onGameOver?: (score: number, level: number, durationSeconds: number) => void; }

