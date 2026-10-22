from pydantic import BaseModel, Field
class GameStartRequest(BaseModel):
    player_name: str = Field(default="Player", max_length=20)
class GameResultRequest(BaseModel):
    player_name: str = Field(default="Player", max_length=20)
    score: int = Field(ge=0, le=10000000)
    level: int = Field(ge=1, le=100000)
    duration_seconds: int = Field(ge=0, le=86400)
