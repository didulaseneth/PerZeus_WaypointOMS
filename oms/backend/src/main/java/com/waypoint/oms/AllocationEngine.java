package com.waypoint.oms;

import java.util.*;
import com.waypoint.oms.Models.*;

/**
 * Allocation engine for Task 2B. Contains NO Spring / Mongo code so it can be unit-tested in isolation.
 *
 *  - {@link #validate} is a rule-for-rule port of docs/check_allocation.py (the official feasibility checker).
 *  - {@link #optimize} is the allocator: a priority-weighted, multi-start greedy + ejection local search that
 *    only ever produces allocations which pass {@link #validate}.
 *
 * Feasibility rules (booklet): one brand + district per trip, reefer for chilled, van for van_only, home depot,
 * whole orders, weight/volume capacity per trip, max 2 trips per vehicle, 270 min (Fresh, pre-dawn) and
 * 480 min (Style/Tech, daytime) daily time budgets per vehicle.
 */
public final class AllocationEngine {
  public static final int BUDGET_PREDAWN = 270;
  public static final int BUDGET_DAYTIME = 480;
  public static final int MAX_TRIPS = 2;
  static final double EPS = 1e-6;

  private AllocationEngine() {}

  // ------------------------------------------------------------------ reference data

  /** district_travel.csv + service_allowance.csv. */
  public static final class Ref {
    final Map<String, int[]> district = new HashMap<>(); // name -> {depot_to_district_min, inter_stop_min}
    final Map<String, Integer> allowance = new HashMap<>(); // "Brand_dock" -> minutes

    public Ref addDistrict(String name, int dtd, int inter) {
      district.put(name, new int[] {dtd, inter});
      return this;
    }

    public Ref addAllowance(String brand, String dock, int minutes) {
      allowance.put(brand + "_" + dock, minutes);
      return this;
    }

    public int dtd(String d) {
      int[] x = district.get(d);
      return x != null ? x[0] : 25;
    }

    public int inter(String d) {
      int[] x = district.get(d);
      return x != null ? x[1] : 8;
    }

    public int allow(String brand, String dock) {
      return allowance.getOrDefault(brand + "_" + dock, 15);
    }
  }

  /** Planned trip duration using the PUBLISHED standard: outbound + (n-1) inter-stop + handling. No return leg. */
  public static int tripMinutes(Ref ref, List<Order> trip) {
    if (trip.isEmpty()) return 0;
    Order first = trip.get(0);
    int t = ref.dtd(first.district) + (trip.size() - 1) * ref.inter(first.district);
    for (Order o : trip) t += ref.allow(first.brand, o.dockType);
    return t;
  }

  public static int budgetFor(String brand) {
    return "Fresh".equalsIgnoreCase(brand) ? BUDGET_PREDAWN : BUDGET_DAYTIME;
  }

  // ------------------------------------------------------------------ validation (port of check_allocation.py)

  public static final class Report {
    public final List<String> errors = new ArrayList<>();
    public final List<String> warnings = new ArrayList<>();
    public int served, deferred;
    public int vehiclesUsed, trips;

    public boolean passed() {
      return errors.isEmpty();
    }
  }

  /**
   * Validate the current allocation. An order counts as "served" when it has a vehicle and trip; everything else is
   * "deferred" (matching how the submission file is produced).
   */
  public static Report validate(List<Order> orders, Map<String, Vehicle> vehicles, Ref ref) {
    Report r = new Report();
    Map<String, Map<Integer, List<Order>>> byVeh = new TreeMap<>();
    for (Order o : orders) {
      if (o.vehicleId == null || o.trip == null) {
        r.deferred++;
        continue;
      }
      r.served++;
      if (o.trip != 1 && o.trip != 2) {
        r.errors.add("[" + o.orderRef + "] trip_id must be 1 or 2");
        continue;
      }
      byVeh.computeIfAbsent(o.vehicleId, k -> new TreeMap<>()).computeIfAbsent(o.trip, k -> new ArrayList<>()).add(o);
    }

    for (Map.Entry<String, Map<Integer, List<Order>>> ve : byVeh.entrySet()) {
      String vid = ve.getKey();
      Vehicle v = vehicles.get(vid);
      if (v == null) {
        r.errors.add("unknown vehicle_id: " + vid);
        continue;
      }
      r.vehiclesUsed++;
      int freshT = 0, otherT = 0;
      for (Map.Entry<Integer, List<Order>> te : ve.getValue().entrySet()) {
        List<Order> g = te.getValue();
        String tag = "[" + vid + " trip " + te.getKey() + "]";
        r.trips++;
        if (!"available".equalsIgnoreCase(v.status)) {
          r.errors.add(tag + " vehicle is in the workshop that day");
          continue;
        }
        Set<String> depots = new TreeSet<>(), brands = new TreeSet<>(), districts = new TreeSet<>();
        double vol = 0, wt = 0;
        boolean chilled = false, vanOnly = false;
        for (Order o : g) {
          depots.add(o.depot);
          brands.add(o.brand);
          districts.add(o.district);
          vol += o.volumeM3;
          wt += o.weightKg;
          chilled |= "chilled".equalsIgnoreCase(o.temp);
          vanOnly |= "van_only".equalsIgnoreCase(o.parking);
        }
        if (depots.size() > 1 || !depots.iterator().next().equalsIgnoreCase(v.depot))
          r.errors.add(tag + " vehicle is based at " + v.depot + " but carries orders for " + depots);
        if (brands.size() > 1) r.errors.add(tag + " mixes brands: " + brands + " (one brand per trip)");
        if (districts.size() > 1) r.errors.add(tag + " mixes districts: " + districts + " (one district per trip)");
        if (chilled && !"reefer".equalsIgnoreCase(v.temp))
          r.errors.add(tag + " carries chilled orders on a non-refrigerated vehicle");
        if (vanOnly && !"van".equalsIgnoreCase(v.type))
          r.errors.add(tag + " sends a " + v.type + " to a van_only outlet");
        if (vol > v.volumeCap + EPS)
          r.errors.add(String.format("%s volume %.1f m3 exceeds capacity %.1f m3", tag, vol, v.volumeCap));
        if (wt > v.weightCap + EPS)
          r.errors.add(String.format("%s weight %.0f kg exceeds capacity %.0f kg", tag, wt, v.weightCap));
        if (brands.size() == 1 && districts.size() == 1) {
          int tt = tripMinutes(ref, g);
          if ("Fresh".equalsIgnoreCase(g.get(0).brand)) freshT += tt;
          else otherT += tt;
        }
      }
      if (ve.getValue().size() > MAX_TRIPS)
        r.errors.add("[" + vid + "] " + ve.getValue().size() + " trips; a vehicle runs at most " + MAX_TRIPS + " a day");
      if (freshT > BUDGET_PREDAWN)
        r.errors.add("[" + vid + "] Fresh trips total " + freshT + " min; the pre-dawn window is " + BUDGET_PREDAWN + " min");
      if (otherT > BUDGET_DAYTIME)
        r.errors.add("[" + vid + "] daytime trips total " + otherT + " min; the daytime window is " + BUDGET_DAYTIME);
    }
    return r;
  }

  // ------------------------------------------------------------------ priority policy

  /**
   * Prioritisation policy (documented in docs/Task2B_Allocation_Policy.md):
   *  1. Fairness  - an outlet skipped on the previous run is served first (+500).
   *  2. Staleness - the longer since the outlet was last served, the higher the priority (+40/day, capped at 10 days).
   *  3. Perishability - Fresh goods cannot wait a day (+60) whereas Style/Tech can be rescheduled.
   *  4. Throughput - every order is worth a base 100, so among equals the plan serves as MANY orders as possible.
   */
  public static double priority(Order o) {
    double p = 100;
    p += 500.0 * Math.min(1, o.deferredYesterday);
    p += 40.0 * (Math.min(Math.max(o.daysSinceLastServed, 1), 10) - 1);
    if ("Fresh".equalsIgnoreCase(o.brand)) p += 60;
    return p;
  }

  // ------------------------------------------------------------------ optimizer

  public static final class Placement {
    public final String vehicleId;
    public final int trip;

    Placement(String v, int t) {
      vehicleId = v;
      trip = t;
    }
  }

  public static final class Plan {
    public final Map<String, Placement> placements = new LinkedHashMap<>(); // candidate orderRef -> placement
    public double score;
    public int served;
  }

  static final class Trip {
    String brand, district;
    double w, v;
    int minutes;
    final List<Order> orders = new ArrayList<>();
  }

  static final class Veh {
    final Vehicle v;
    final boolean reefer, van;
    final Trip[] trips = new Trip[MAX_TRIPS];
    int fresh, day;

    Veh(Vehicle v) {
      this.v = v;
      reefer = "reefer".equalsIgnoreCase(v.temp);
      van = "van".equalsIgnoreCase(v.type);
    }

    void recompute(Ref ref) {
      fresh = 0;
      day = 0;
      for (int i = 0; i < MAX_TRIPS; i++) {
        Trip t = trips[i];
        if (t == null) continue;
        t.w = 0;
        t.v = 0;
        for (Order o : t.orders) {
          t.w += o.weightKg;
          t.v += o.volumeM3;
        }
        t.minutes = tripMinutes(ref, t.orders);
        if ("Fresh".equalsIgnoreCase(t.brand)) fresh += t.minutes;
        else day += t.minutes;
      }
    }
  }

  /** Cost of the best way to place the order on (veh, tripIdx); negative = infeasible. */
  private static double fitCost(Order o, Veh vh, int ti, Ref ref, double maxVol, Random rnd, double noise) {
    Vehicle v = vh.v;
    if (!v.depot.equalsIgnoreCase(o.depot)) return -1;
    if ("chilled".equalsIgnoreCase(o.temp) && !vh.reefer) return -1;
    if ("van_only".equalsIgnoreCase(o.parking) && !vh.van) return -1;
    Trip t = vh.trips[ti];
    boolean fresh = "Fresh".equalsIgnoreCase(o.brand);
    int add;
    double w = o.weightKg, vol = o.volumeM3;
    if (t == null) {
      add = ref.dtd(o.district) + ref.allow(o.brand, o.dockType);
    } else {
      if (!t.brand.equalsIgnoreCase(o.brand) || !t.district.equalsIgnoreCase(o.district)) return -1;
      add = ref.inter(o.district) + ref.allow(o.brand, o.dockType);
      w += t.w;
      vol += t.v;
    }
    if (w > v.weightCap + EPS || vol > v.volumeCap + EPS) return -1;
    if (fresh ? vh.fresh + add > BUDGET_PREDAWN : vh.day + add > BUDGET_DAYTIME) return -1;

    double leftover = Math.min(1 - w / v.weightCap, 1 - vol / v.volumeCap); // 0 = perfectly full
    double cost;
    if (t != null) {
      cost = leftover; // joining an open trip is always cheaper than opening a new one
    } else {
      cost = 10 + leftover * 2 + (v.volumeCap / maxVol); // prefer the smallest vehicle that fits
      boolean needsReefer = "chilled".equalsIgnoreCase(o.temp);
      if (vh.reefer && !needsReefer) cost += 6; // protect scarce reefers for chilled orders
      if (vh.van && !"van_only".equalsIgnoreCase(o.parking)) cost += 4; // protect scarce vans for van_only outlets
      // keep time headroom: prefer vehicles that still have a lot of their budget left unused only if equal
      cost += (fresh ? vh.fresh / (double) BUDGET_PREDAWN : vh.day / (double) BUDGET_DAYTIME) * 0.5;
    }
    return cost + (noise > 0 ? rnd.nextDouble() * noise : 0);
  }

  private static void put(Order o, Veh vh, int ti, Ref ref) {
    if (vh.trips[ti] == null) {
      Trip t = new Trip();
      t.brand = o.brand;
      t.district = o.district;
      vh.trips[ti] = t;
    }
    vh.trips[ti].orders.add(o);
    vh.recompute(ref);
  }

  private static void take(Order o, Veh vh, int ti, Ref ref) {
    Trip t = vh.trips[ti];
    t.orders.remove(o);
    if (t.orders.isEmpty()) vh.trips[ti] = null;
    vh.recompute(ref);
  }

  /** Best (vehicle, trip) for an order, or null. */
  private static int[] bestSlot(Order o, List<Veh> vs, Ref ref, double maxVol, Random rnd, double noise) {
    double best = Double.MAX_VALUE;
    int[] arg = null;
    for (int i = 0; i < vs.size(); i++) {
      for (int ti = 0; ti < MAX_TRIPS; ti++) {
        double c = fitCost(o, vs.get(i), ti, ref, maxVol, rnd, noise);
        if (c >= 0 && c < best) {
          best = c;
          arg = new int[] {i, ti};
        }
      }
    }
    return arg;
  }

  /**
   * Allocate {@code candidates} onto {@code vehicles} around {@code fixed} (orders that already hold a vehicle/trip and
   * must not move). Deterministic for a given seed.
   */
  public static Plan optimize(List<Order> fixed, List<Order> candidates, List<Vehicle> vehicles, Ref ref,
                              long seed, int iterations) {
    List<Vehicle> usable = new ArrayList<>();
    for (Vehicle v : vehicles) if ("available".equalsIgnoreCase(v.status) && !v.departed) usable.add(v);
    usable.sort(Comparator.comparing((Vehicle v) -> v.id));
    double maxVol = usable.stream().mapToDouble(v -> v.volumeCap).max().orElse(1);

    Plan best = null;
    Random rnd = new Random(seed);
    for (int it = 0; it < Math.max(1, iterations); it++) {
      List<Veh> vs = new ArrayList<>();
      Map<String, Veh> idx = new HashMap<>();
      for (Vehicle v : usable) {
        Veh vh = new Veh(v);
        vs.add(vh);
        idx.put(v.id, vh);
      }
      for (Order f : fixed) {
        Veh vh = idx.get(f.vehicleId);
        if (vh == null || f.trip == null || f.trip < 1 || f.trip > 2) continue;
        if (vh.trips[f.trip - 1] == null) {
          Trip t = new Trip();
          t.brand = f.brand;
          t.district = f.district;
          vh.trips[f.trip - 1] = t;
        }
        vh.trips[f.trip - 1].orders.add(f);
      }
      for (Veh vh : vs) vh.recompute(ref);

      // iteration 0 is the pure policy order; later iterations perturb it to explore packings
      double sigma = it == 0 ? 0 : 20 + rnd.nextDouble() * 300;
      double noise = it == 0 ? 0 : rnd.nextDouble() * 1.5;
      Map<Order, Double> key = new IdentityHashMap<>();
      for (Order o : candidates) {
        key.put(o, priority(o) + o.weightKg / 40.0 + (sigma > 0 ? rnd.nextGaussian() * sigma : 0));
      }
      List<Order> seq = new ArrayList<>(candidates);
      seq.sort((a, b) -> Double.compare(key.get(b), key.get(a)));

      Map<Order, int[]> where = new IdentityHashMap<>();
      List<Order> left = new ArrayList<>();
      for (Order o : seq) {
        int[] s = bestSlot(o, vs, ref, maxVol, rnd, noise);
        if (s == null) {
          left.add(o);
          continue;
        }
        put(o, vs.get(s[0]), s[1], ref);
        where.put(o, s);
      }

      // ejection local search: a higher-priority unserved order may displace a lower-priority served one
      // if the displaced order can then be re-homed or the net priority gain is positive.
      boolean improved = true;
      int guard = 0;
      while (improved && guard++ < 6) {
        improved = false;
        left.sort((a, b) -> Double.compare(priority(b), priority(a)));
        for (Iterator<Order> li = left.iterator(); li.hasNext(); ) {
          Order u = li.next();
          int[] direct = bestSlot(u, vs, ref, maxVol, rnd, 0);
          if (direct != null) {
            put(u, vs.get(direct[0]), direct[1], ref);
            where.put(u, direct);
            li.remove();
            improved = true;
            continue;
          }
          Order bestX = null;
          double bestGain = 1e-9;
          for (Map.Entry<Order, int[]> e : new ArrayList<>(where.entrySet())) {
            Order x = e.getKey();
            if (priority(x) >= priority(u)) continue;
            int[] s0 = e.getValue();
            take(x, vs.get(s0[0]), s0[1], ref);
            int[] su = bestSlot(u, vs, ref, maxVol, rnd, 0);
            double gain = 0;
            if (su != null) {
              put(u, vs.get(su[0]), su[1], ref);
              int[] sx = bestSlot(x, vs, ref, maxVol, rnd, 0);
              gain = priority(u) - (sx != null ? 0 : priority(x));
              take(u, vs.get(su[0]), su[1], ref);
            }
            put(x, vs.get(s0[0]), s0[1], ref); // restore
            if (su != null && gain > bestGain) {
              bestGain = gain;
              bestX = x;
            }
          }
          if (bestX != null) {
            int[] s0 = where.remove(bestX);
            take(bestX, vs.get(s0[0]), s0[1], ref);
            int[] su = bestSlot(u, vs, ref, maxVol, rnd, 0);
            put(u, vs.get(su[0]), su[1], ref);
            where.put(u, su);
            li.remove();
            int[] sx = bestSlot(bestX, vs, ref, maxVol, rnd, 0);
            if (sx != null) {
              put(bestX, vs.get(sx[0]), sx[1], ref);
              where.put(bestX, sx);
            } else {
              left.add(bestX);
              break; // list mutated; restart the sweep
            }
            improved = true;
          }
        }
      }

      double score = 0;
      for (Order o : where.keySet()) score += priority(o);
      if (best == null || score > best.score + 1e-9) {
        Plan p = new Plan();
        p.score = score;
        p.served = where.size();
        for (Order o : candidates) {
          int[] s = where.get(o);
          if (s != null) p.placements.put(o.orderRef, new Placement(vs.get(s[0]).v.id, s[1] + 1));
        }
        best = p;
      }
    }
    return best == null ? new Plan() : best;
  }

  /** Human explanation of why an order could not be placed (used as the deferral reason). */
  public static String deferralReason(Order o, List<Vehicle> vehicles) {
    boolean chilled = "chilled".equalsIgnoreCase(o.temp), vanOnly = "van_only".equalsIgnoreCase(o.parking);
    long eligible = vehicles.stream()
      .filter(v -> "available".equalsIgnoreCase(v.status) && v.depot.equalsIgnoreCase(o.depot))
      .filter(v -> !chilled || "reefer".equalsIgnoreCase(v.temp))
      .filter(v -> !vanOnly || "van".equalsIgnoreCase(v.type))
      .count();
    if (eligible == 0) return "No eligible vehicle available today (" + (chilled ? "reefer" : "") + (chilled && vanOnly ? " + " : "") + (vanOnly ? "van-only access" : "") + ")";
    if (chilled) return "Reefer capacity exhausted — chilled demand exceeds refrigerated trips available before 08:00";
    if ("Fresh".equalsIgnoreCase(o.brand)) return "Pre-dawn 270-min budget exhausted — lower priority than served Fresh orders";
    return "Daytime capacity exhausted — lower priority than served orders";
  }
}
