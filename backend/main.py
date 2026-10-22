from contextlib import asynccontextmanager
from collections import deque
import time
from threading import Lock
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from database import add_game_result, get_history, get_leaderboard, init_db
from models import GameResultRequest, GameStartRequest
class TrafficTracker:
    def __init__(self):
        self.total_http_requests=0; self.games_started=0; self.games_finished=0; self.bytes_transferred=0; self.started_at=time.time(); self.recent_requests=deque(maxlen=50); self.lock=Lock()
    def log_request(self,method,path,status,duration_ms,size):
        with self.lock:
            self.total_http_requests+=1; self.bytes_transferred+=size
            if path!="/api/traffic":self.recent_requests.appendleft({"timestamp":time.strftime("%H:%M:%S"),"method":method,"endpoint":path,"status_code":status,"duration_ms":round(duration_ms,2),"bytes":size})
traffic=TrafficTracker()
@asynccontextmanager
async def lifespan(app:FastAPI):
    init_db(); yield
app=FastAPI(title="CyberSnake API",version="1.0.0",lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],allow_methods=["GET","POST"],allow_headers=["Content-Type"])
class TrafficMiddleware(BaseHTTPMiddleware):
    async def dispatch(self,request:Request,call_next):
        started=time.perf_counter(); response=await call_next(request); elapsed=(time.perf_counter()-started)*1000
        response_length=response.headers.get("content-length","0"); request_length=request.headers.get("content-length","0"); size=(int(response_length) if response_length.isdigit() else 0)+(int(request_length) if request_length.isdigit() else 0)
        traffic.log_request(request.method,request.url.path,response.status_code,elapsed,size); return response
app.add_middleware(TrafficMiddleware)
@app.get("/api/health")
def health():return {"status":"online","service":"CyberSnake API","uptime_seconds":round(time.time()-traffic.started_at,1)}
@app.post("/api/game/start")
def start_game(payload:GameStartRequest):
    with traffic.lock:traffic.games_started+=1
    return {"status":"started","player_name":payload.player_name.strip()[:16] or "Player"}
@app.post("/api/game/record")
def record_game(payload:GameResultRequest):
    result=add_game_result(payload.player_name,payload.score,payload.level,payload.duration_seconds)
    with traffic.lock:traffic.games_finished+=1
    return {"status":"recorded",**result}
@app.get("/api/leaderboard")
def leaderboard(limit:int=10):return get_leaderboard(limit)
@app.get("/api/game/history")
def game_history(limit:int=25):return get_history(limit)
@app.get("/api/traffic")
def traffic_stats():
    with traffic.lock:return {"total_http_requests":traffic.total_http_requests,"games_started":traffic.games_started,"games_finished":traffic.games_finished,"bytes_transferred":traffic.bytes_transferred,"server_uptime_seconds":round(time.time()-traffic.started_at,1),"recent_requests":list(traffic.recent_requests)}

