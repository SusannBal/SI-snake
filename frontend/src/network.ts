export interface TrafficLog { timestamp:string; method:string; endpoint:string; status_code:number; duration_ms:number; bytes:number; }
export interface TrafficStats { total_http_requests:number; games_started:number; games_finished:number; bytes_transferred:number; server_uptime_seconds:number; recent_requests:TrafficLog[]; }
export interface LeaderboardEntry { id:number; player_name:string; score:number; level:number; duration_seconds:number; created_at:string; }
async function request<T>(path:string,init?:RequestInit):Promise<T>{
 const headers=new Headers(init?.headers);
 if(!headers.has('Content-Type'))headers.set('Content-Type','application/json');
 const response=await fetch(path,{...init,headers});
 if(!response.ok)throw new Error(`Error ${response.status} al consultar ${path}`);
 return response.json() as Promise<T>;
}
export const api={
 health:()=>request<{status:string}>('/api/health'),
 startGame:(playerName:string)=>request<{status:string}>('/api/game/start',{method:'POST',body:JSON.stringify({player_name:playerName})}),
 recordGame:(playerName:string,score:number,level:number,durationSeconds:number)=>request<{status:string}>('/api/game/record',{method:'POST',body:JSON.stringify({player_name:playerName,score,level,duration_seconds:durationSeconds})}),
 traffic:()=>request<TrafficStats>('/api/traffic'),
 leaderboard:()=>request<LeaderboardEntry[]>('/api/leaderboard?limit=5'),
};
