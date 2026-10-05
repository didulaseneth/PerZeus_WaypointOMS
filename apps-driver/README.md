# Waypoint Driver

Driver mobile/web app for the Waypoint logistics platform. Runs with **Docker + MongoDB**.

## Quick start

```bash
docker compose up --build
```

- **Frontend**: http://localhost:3000  
- **API**: http://localhost:4000  
- **MongoDB**: localhost:27017 (db: `waypoint_driver`)

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stops` | List delivery stops |
| PATCH | `/api/stops/:id` | Update stop status |
| GET | `/api/driver` | Current driver profile |
| GET | `/api/messages` | Inbox messages |

## Local development (without Docker)

### Backend
```bash
cd backend
npm install
MONGO_URI=mongodb://localhost:27017/waypoint_driver npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project structure

```
waypoint-driver/
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

- Frontend currently uses local React state / seed data for the full UI experience.
- Backend seeds sample stops, driver, and messages into MongoDB on first start.
- Data persists in the `driver_mongo_data` Docker volume.
