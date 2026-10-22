# CyberSnake

Proyecto independiente con una estructura similar a CyberTetris:

```text
Snake/
├── start.bat
├── backend/       # FastAPI, SQLite, ranking y monitor de tráfico
└── frontend/      # Vite + TypeScript, juego y panel del servidor
```

## Preparación (primera vez)

Se necesita Python 3.10+ y Node.js/npm.

```powershell
cd backend
python -m pip install -r requirements.txt
cd ..\frontend
npm install
```

## Iniciar

En Windows, ejecuta `start.bat`. Abre `http://localhost:5174`.

También se puede iniciar por separado:

```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

```powershell
cd frontend
npm run dev
```

## API y monitor

- `GET /api/health`: estado del backend.
- `POST /api/game/start`: registra una partida iniciada.
- `POST /api/game/record`: guarda resultado y puntuación en SQLite.
- `GET /api/leaderboard`: ranking.
- `GET /api/game/history`: historial reciente.
- `GET /api/traffic`: contadores y últimas peticiones HTTP.
- `GET /docs`: documentación de la API.

Vite reenvía las llamadas `/api` al backend FastAPI. El ranking persiste en `backend/snake.db`; los contadores de tráfico se reinician con el backend. Para producción, compila el frontend con `npm run build` y publica el backend detrás de un proxy HTTPS.


## Interfaz y recursos Slither.py

El frontend web adapta la estética synthwave de [Slither.py](https://github.com/vincenzomaritato/slither-py): paleta neón, fuente pixel, pantalla de inicio/pausa/fin, selector de skins y controles de sonido. Se incorporaron los efectos `eat.mp3` y `hit.mp3` y la ilustración synthwave del proyecto. La licencia MIT original está en `frontend/public/assets/licenses/slither-py-MIT-LICENSE.txt`.
