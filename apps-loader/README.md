# Waypoint Loader

Loader / warehouse app for the Waypoint logistics platform. Runs with **Docker + MongoDB**.

## Quick start

```bash
docker compose up --build
```

- **Frontend**: http://localhost:3002  
- **API**: http://localhost:4002  
- **MongoDB**: localhost:27019 (db: `waypoint_loader`)

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/runs` | List loading runs |
| PATCH | `/api/runs/:id` | Update run |
| GET | `/api/items` | List items (`?runId=`) |
| PATCH | `/api/items/:sku` | Update item status |
| GET | `/api/stops` | Delivery stops |
| GET | `/api/messages` | Inbox messages |

## Local development (without Docker)

### Backend
```bash
cd backend
npm install
MONGO_URI=mongodb://localhost:27017/waypoint_loader npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project structure

```
waypoint-loader/
├── docker-compose.yml
├── backend/          # Express + Mongoose API
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
└── frontend/         # React + Vite + Tailwind
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
```

## Notes

- Frontend uses React store with seed data for the full UI experience.
- Backend seeds sample runs, items, stops, and messages into MongoDB on first start.
- Data persists in the `loader_mongo_data` Docker volume.
- Ports are offset (3002 / 4002 / 27019) so you can run all three projects simultaneously.
