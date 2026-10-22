from contextlib import contextmanager
from datetime import datetime
import os
import sqlite3
from typing import Any, Iterator

DB_PATH = os.path.join(os.path.dirname(__file__), "snake.db")


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_db() -> None:
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS game_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_name TEXT NOT NULL,
                score INTEGER NOT NULL,
                level INTEGER NOT NULL,
                duration_seconds INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
        """)


def add_game_result(player_name: str, score: int, level: int, duration_seconds: int) -> dict[str, Any]:
    name = (player_name or "Player").strip()[:16] or "Player"
    created = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO game_results (player_name, score, level, duration_seconds, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, max(0, score), max(1, level), max(0, duration_seconds), created),
        )
        return {"id": cursor.lastrowid, "player_name": name, "score": score, "level": level,
                "duration_seconds": duration_seconds, "created_at": created}


def get_leaderboard(limit: int = 10) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT id, player_name, score, level, duration_seconds, created_at FROM game_results ORDER BY score DESC, id ASC LIMIT ?",
            (max(1, min(limit, 100)),),
        ).fetchall()
        return [dict(row) for row in rows]


def get_history(limit: int = 25) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT id, player_name, score, level, duration_seconds, created_at FROM game_results ORDER BY id DESC LIMIT ?",
            (max(1, min(limit, 100)),),
        ).fetchall()
        return [dict(row) for row in rows]
