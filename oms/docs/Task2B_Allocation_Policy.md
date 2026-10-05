# Task 2B — Peak-day allocation policy (Scenario S1, Peliyagoda)

**Result:** 76 of 85 orders served, 9 deferred; `check_allocation.py` reports *FEASIBILITY: PASSED*.
The plan uses 14 vehicles and 26 trips. The file is `docs/submission_task2b.csv`.
Reproduce it: dispatcher → **Re-plan all**, then **Export CSV** (or `POST /api/allocations/auto?rebuild=true&deferRest=true`).

## What limits the day
| Resource | Evidence |
|---|---|
| **Refrigerated pre-dawn time** (binding) | 26 chilled orders (about 193 m³) but only 4 reefers. The three reefer trucks finish at 270, 264 and 259 of their 270 Fresh minutes. |
| Order size vs vehicle size | The reefer van (VEH036, 7 m³) has spare minutes (183/270) but cannot carry the large chilled orders. |
| Physical impossibility | S1-078 (Style, Kurunegala) is 40.66 m³, larger than the biggest vehicle (38 m³). It cannot be loaded whole. |
| Not limiting | Ambient capacity: 58 of 59 ambient orders are served; ambient trucks have headroom. |

## Priority policy
Each order is scored `priority = 100 + 500·[skipped yesterday] + 40·(days since last served − 1, capped at 10 days) + 60·[Fresh]`, and the plan maximises the total score of the orders it serves.

1. **Fairness first.** An outlet skipped on the previous run is served before anyone else (+500). All 10 such orders are served.
2. **Staleness.** The longer an outlet has waited, the higher it ranks (+40/day). All 7 orders unserved for 3 or more days are served.
3. **Perishability.** Fresh cannot wait a day; Style and Tech can be rescheduled (+60 for Fresh).
4. **Throughput.** Every order carries a base 100, so between otherwise equal orders the plan serves the most orders. That favours several small orders over one large order that would consume a whole reefer trip.

## How the plan is built
Orders are placed by best fit into open trips of the same brand and district, or onto the smallest vehicle that fits. Reefers are kept for chilled orders and vans for van-only outlets. A multi-start search (1,500 randomised passes) plus an ejection step lets a higher-priority order displace a lower-priority one when the swap raises the score. Every candidate is checked against all seven feasibility rules, including the 270 min (Fresh) and 480 min (Style/Tech) budgets.

## Deferral decisions
| Order | Why deferred |
|---|---|
| S1-003, S1-033, S1-058, S1-064, S1-067, S1-071, S1-073, S1-075 | Chilled, and reefer pre-dawn time is exhausted. None was skipped yesterday and all have waited 2 days or fewer, so they rank below every served order that is more overdue. |
| S1-078 | 40.66 m³ exceeds every vehicle's volume capacity. It needs splitting by the outlet or a larger vehicle; scheduling cannot fix it. |

Deferred orders carry the reschedule "Next Run (Tomorrow)" and will gain +500 priority tomorrow, so they lead the next run.
