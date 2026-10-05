# Waypoint Unified Platform

**One login → each role opens their dedicated system**

| Role | After login opens | URL |
|------|-------------------|-----|
| **Dispatcher** | Core OMS dispatcher workspace | http://localhost:5173/dispatcher |
| **Loader** | Polished Loader app | http://localhost:3002 |
| **Driver** | Polished Driver app | http://localhost:3000 |
| **Store Manager** | Polished Store Manager app | http://localhost:3001 |

---

## Quick start

```bash
cd waypoint-unified
docker compose up --build
```

1. Open **http://localhost:5173/login**
2. Sign in with a role account
3. You are redirected to that role’s system automatically

### Demo credentials

| Role | Username | Password |
|------|----------|----------|
| Dispatcher | `dispatcher` | `dispatch123` |
| Store Manager | `out001` | `store123` |
| Loader | `loader01` | `loader123` |
| Driver | `driver001` | `driver123` |

---

## Ports

| Service | Port |
|---------|------|
| Unified login + Dispatcher UI | 5173 |
| OMS API (Spring) | 8080 |
| Driver system | 3000 (API 4000) |
| Store Manager system | 3001 (API 4001) |
| Loader system | 3002 (API 4002) |
| MongoDB | 27017 |

---

## Why you previously saw OMS Loader/Driver/Store pages

The first merge used the **OMS multi-role SPA** for every role (same shell, different routes).  
That is still available at `/loader`, `/driver`, `/store-manager` on port 5173 if you navigate there manually.

**Now**, after a successful login:

- **Dispatcher** stays in the OMS UI  
- **Loader / Driver / Store Manager** are sent to their **dedicated apps** (the original projects), with SSO query params so those apps skip their own login screens.

---

## Rebuild after pulling this update

```bash
docker compose down
docker compose up --build
```

The frontend image must be rebuilt so the new redirect logic is included.


---

## Backend data & allocation

Seed data is generated from the official competition CSVs in `oms/docs/data/`.

- **85 peak-day orders (S1)**, **60 vehicles**, **120 outlets**, district travel times, service allowances
- `AllocationEngine.java` is a rule-for-rule port of `oms/docs/check_allocation.py`
- After first boot with an old Mongo volume, reset data:

```bash
curl -X POST http://localhost:8080/api/seed/reset
```

Then open the dispatcher, run **Auto-allocate** / **Re-plan all**, and **Validate** / **Export CSV**.
See `oms/docs/BACKEND_DATA.md` for full details.
