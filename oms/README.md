# Waypoint OMS – Dispatcher Order Allocation
React + Tailwind (Vite) · Spring Boot 3 · MongoDB. Seed data comes from the competition CSVs (`backend/src/main/resources/seed`, auto-loaded on first start).

## Run
`docker compose up --build` → http://localhost:5173/dispatcher
Dev: `mongod`; `cd backend && mvn spring-boot:run`; `cd frontend && npm i && npm run dev` (proxy → :8080).

## Flow
1. `/store-manager` – place an order → lands in MongoDB as CONFIRMED.
2. `/dispatcher` – left: unallocated orders (filter by brand). Right: available vehicles with Trip 1 / Trip 2 slots (workshop vehicles greyed). Drag an order onto a slot.
3. The server validates all 7 feasibility rules (brand+district per trip, reefer, van-only, home depot, weight/volume, max 2 trips, 270/480 min budgets using district_travel + service_allowance). Violations show a red message and the drop is rejected.
4. Assigned orders leave the queue (shown inside the trip; "Unassign" returns them). "Defer" records a reason.
5. Click a vehicle / "Route & Map" → dialog with Leaflet map (depot → stops, truck marker, progress slider), trip time/load, and loader selection (one loader per vehicle, same depot). Driver is shown per vehicle.

## Task 2B allocation engine (merged from `check_allocation.py` + competition data)

**Data.** The competition datasets are in `docs/data/`. The MongoDB seed (`backend/src/main/resources/seed`) was verified
identical to `task2b_peak_day_scenarios.csv`, `task2b_peak_day_fleet.csv`, `vehicles.csv`, `district_travel.csv` and
`service_allowance.csv` (85 S1 orders, 60 vehicles).

**Rules.** `AllocationEngine.java` is a rule-for-rule port of `docs/check_allocation.py` (brand + district per trip, reefer,
van-only, home depot, capacity with 1e-6 tolerance, max 2 trips, 270 / 480 min budgets). Manual drag-and-drop uses the same
rules.

**Allocator.** *Auto-allocate remaining* and *Re-plan all* use a priority-weighted multi-start search instead of first-fit.
Policy and results for S1: `docs/Task2B_Allocation_Policy.md` (76 / 85 served, passes the official checker).

| Dispatcher button | API |
|---|---|
| Auto-allocate remaining | `POST /api/allocations/auto` (keeps manual assignments) |
| Re-plan all | `POST /api/allocations/auto?rebuild=true&deferRest=true` |
| Defer remaining | `POST /api/allocations/defer-rest` |
| Check / Confirm plan | `GET /api/allocations/validate` (same rules as the checker) |
| Export CSV | `GET /api/allocations/export` → `submission_task2b.csv` |

Check an exported file with the official script: `python docs/check_allocation.py docs/submission_task2b.csv`
(needs `pandas`; it finds the data under `docs/data`). Only orders whose reference looks like `S1-000` are exported;
orders placed live by store managers (`ORD1234`) are not part of the scenario file.

`prototypes/` holds the three standalone role UIs (Driver, Loader, Store Manager). They use static data and are not wired
to the backend; the same roles are already implemented against the API inside `frontend/`.

## API
GET /api/board · POST /api/allocations · DELETE /api/allocations/{ref} · POST /api/orders/{ref}/defer · PUT /api/vehicles/{id}/loader · GET/POST /api/orders|outlets

## All four roles (login at http://localhost:5173)
| Role | Username / password | Screen |
|---|---|---|
| Dispatcher | `dispatcher` / `dispatch123` | `/dispatcher` |
| Loader | `loader01`…`loader12` (Peliyagoda) / `loader123` | `/loader` |
| Driver | `driver003` (= VEH003) … / `driver123` | `/driver` |
| Store manager | `out001`…`out120` / `store123` | `/store-manager` |

### End-to-end walkthrough
1. Store manager (`out001`) → Place order.
2. Dispatcher → drag orders onto a vehicle's Trip slot (try VEH003 with OUT001's orders) → pick a loader (e.g. loader01 / LDR01) on that vehicle.
3. Loader (`loader01`) → sees that vehicle's run, ticks items (last stop first), can Flag items → Confirm Load Complete.
4. Driver (`driver003`, same vehicle) → sees the run → I've Arrived → Complete Delivery (POD). Turn the backend off to see offline queueing; it syncs on reconnect.
5. Store manager → tracks ETA and status, then Confirm Receipt or Report Issue. Dispatcher's vehicle card shows loading and delivery progress and flagged items.

Demo note: passwords are plain text and RBAC is enforced by the frontend route guards only. Add JWT + backend role checks before production.

## Time-based Themes (fixed)

The UI automatically switches themes based on local time:

| Theme   | Hours (local) | Look                                      |
|---------|---------------|-------------------------------------------|
| Morning | 05:00–11:59   | Bright light background, dark text        |
| Evening | 12:00–17:59   | Warm dusk (purple-brown tones)            |
| Night   | 18:00–04:59   | Deep cool dark (blue-black)               |

- Default preference is **Auto** (follows the clock, re-checked every 30s).
- Click the theme badge in the header to cycle: **Auto → Morning → Evening → Night → Auto**.
- Font colors, surfaces, borders, and accents update with each theme.
- Tailwind `darkMode: "class"` is enabled so all existing `dark:` utilities work for evening & night.

Preference is stored in `localStorage` under `wp_theme_preference`.
