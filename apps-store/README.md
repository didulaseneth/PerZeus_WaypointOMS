# Waypoint Store Manager

Store manager web app for the Waypoint logistics platform. Runs with **Docker + MongoDB**.

## Quick start

```bash
docker compose up --build
```

- **Frontend**: http://localhost:3001  
- **API**: http://localhost:4001  
- **MongoDB**: localhost:27018 (db: `waypoint_store_manager`)

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id` | Update order |
| GET | `/api/catalog` | Product catalog |

## Local development (without Docker)

### Backend
```bash
cd backend
npm install
MONGO_URI=mongodb://localhost:27017/waypoint_store_manager npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project structure

```
waypoint-store-manager/
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

- Frontend uses React context with seed data for the full UI experience.
- Backend seeds sample orders and catalog into MongoDB on first start.
- Data persists in the `sm_mongo_data` Docker volume.
- Ports are offset (3001 / 4001 / 27018) so you can run all three projects simultaneously.
