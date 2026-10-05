# Backend data & allocation logic

## Source of truth

| Seed file | Built from |
|-----------|------------|
| `orders.json` (85 S1 orders) | `Test Data/task2b_peak_day_scenarios.csv` |
| `vehicles.json` (60) + workshop status | `General Data/vehicles.csv` + `Test Data/task2b_peak_day_fleet.csv` |
| `outlets.json` (120) | `General Data/outlets.csv` |
| `districts.json` (12) | `General Data/district_travel.csv` |
| `allowances.json` (9) | `General Data/service_allowance.csv` |
| `users.json` (~197) | derived (dispatcher, loaders, drivers, store managers) |

Official CSVs live under `docs/data/`. Official feasibility checker: `docs/check_allocation.py`.

## Feasibility rules (AllocationEngine = port of check_allocation.py)

1. One **brand** per trip  
2. One **district** per trip  
3. Vehicle **home depot** must match order depot  
4. **Reefer** required for chilled  
5. **Van** required for `van_only` parking  
6. **Weight / volume** capacity per trip  
7. Max **2 trips** per vehicle per day  
8. Time budgets: **270 min** Fresh (pre-dawn), **480 min** Style/Tech (daytime)  
   - trip time = depot→district + (n−1)×inter-stop + Σ service_allowance  

## API (core)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/login` | Authenticate |
| GET | `/api/board?depot=` | Dispatcher board |
| POST | `/api/allocations` | Manual assign |
| DELETE | `/api/allocations/{ref}` | Unassign |
| POST | `/api/allocations/auto` | Auto-allocate (passes validate) |
| GET | `/api/allocations/validate` | Same rules as checker |
| GET | `/api/allocations/export` | `submission_task2b.csv` |
| POST | `/api/seed/reset` | Reload seed from JSON |
| POST | `/api/allocations/reset` | Clear allocations only |

## Verify with official checker

```bash
# After auto-allocate + export from UI or:
curl -o /tmp/sub.csv http://localhost:8080/api/allocations/export
cd oms/docs
python3 check_allocation.py /tmp/sub.csv
```

Expected: `FEASIBILITY: PASSED` when using auto-allocate from a clean seed.
