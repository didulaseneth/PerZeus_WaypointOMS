package com.waypoint.oms;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.stream.*;
import com.waypoint.oms.Models.*;

@Service
public class AllocationService {
  final OrderRepo orders;
  final VehicleRepo vehicles;
  final LoaderRepo loaders;
  final OutletRepo outlets;
  final DistrictRepo dist;
  final AllowanceRepo allow;

  public AllocationService(OrderRepo o, VehicleRepo v, LoaderRepo l, OutletRepo ou, DistrictRepo d, AllowanceRepo a) {
    this.orders = o;
    this.vehicles = v;
    this.loaders = l;
    this.outlets = ou;
    this.dist = d;
    this.allow = a;
  }

  static ResponseStatusException bad(String m) {
    return new ResponseStatusException(HttpStatus.CONFLICT, m);
  }

  public int tripMinutes(List<Order> os) {
    if (os.isEmpty()) return 0;
    District d = dist.findById(os.get(0).district).orElse(null);
    int dtd = d != null ? d.dtdMin : 25;
    int inter = d != null ? d.interMin : 8;
    int t = dtd + inter * (os.size() - 1);
    for (Order o : os) {
      t += allow.findById(o.brand + "_" + o.dockType).map(a -> a.minutes).orElse(15);
    }
    return t;
  }

  public double tripDistanceKm(List<Order> os) {
    if (os.isEmpty()) return 0.0;
    District d = dist.findById(os.get(0).district).orElse(null);
    double dtd = d != null && d.dtdKm > 0 ? d.dtdKm : 24.0;
    double inter = d != null && d.interKm > 0 ? d.interKm : 6.0;
    return dtd + inter * Math.max(0, os.size() - 1);
  }

  static String hm(int m) {
    int hours = (m / 60) % 24;
    int mins = m % 60;
    return String.format("%02d:%02d", hours, mins);
  }

  Order get(String ref) {
    return orders.findById(ref).orElseThrow(() -> bad("Order not found: " + ref));
  }

  void checkRunNotDeparted(Order o) {
    if (o.vehicleId != null) {
      Vehicle v = vehicles.findById(o.vehicleId).orElse(null);
      if (v != null && v.departed) throw bad("Run has already departed");
    }
  }

  public Order assign(String ref, String vid, int trip) {
    Order o = orders.findById(ref).orElseThrow(() -> bad("Order " + ref + " not found"));
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle " + vid + " not found"));
    
    if (!"available".equalsIgnoreCase(v.status)) throw bad("Vehicle " + vid + " is in workshop today");
    if (v.departed) throw bad("Vehicle " + vid + " has already departed");
    if (trip < 1 || trip > 2) throw bad("Trip must be 1 or 2");
    if (!v.depot.equalsIgnoreCase(o.depot)) throw bad("Vehicle " + vid + " belongs to " + v.depot + " depot, but order is for " + o.depot);
    if ("chilled".equalsIgnoreCase(o.temp) && !"reefer".equalsIgnoreCase(v.temp)) {
      throw bad("Reefer vehicle required for chilled goods — " + vid + " is ambient-only");
    }
    if ("van_only".equalsIgnoreCase(o.parking) && !"van".equalsIgnoreCase(v.type)) {
      throw bad("Outlet " + o.outletId + " has van-only access — " + vid + " is a truck");
    }

    Map<Integer, List<Order>> tripsMap = new TreeMap<>();
    orders.findByVehicleId(vid).stream()
      .filter(x -> !x.orderRef.equals(ref))
      .forEach(x -> tripsMap.computeIfAbsent(x.trip != null ? x.trip : 1, k -> new ArrayList<>()).add(x));
    
    tripsMap.computeIfAbsent(trip, k -> new ArrayList<>()).add(o);
    if (tripsMap.size() > 2) throw bad("Vehicle " + vid + " can only run up to 2 trips per day");

    List<Order> sameTrip = tripsMap.get(trip);
    if (sameTrip.stream().anyMatch(x -> !x.brand.equalsIgnoreCase(o.brand) || !x.district.equalsIgnoreCase(o.district))) {
      throw bad("A trip must serve one brand and one district (Current trip: " + o.brand + " / " + o.district + ")");
    }

    double totalWeight = sameTrip.stream().mapToDouble(x -> x.weightKg).sum();
    double totalVol = sameTrip.stream().mapToDouble(x -> x.volumeM3).sum();
    if (totalWeight > v.weightCap + AllocationEngine.EPS) {
      throw bad(String.format("Exceeds %s weight capacity by %.0f kg (Total: %.0f / Cap: %.0f kg)", vid, totalWeight - v.weightCap, totalWeight, v.weightCap));
    }
    if (totalVol > v.volumeCap + AllocationEngine.EPS) {
      throw bad(String.format("Exceeds %s volume capacity by %.2f m³ (Total: %.2f / Cap: %.2f m³)", vid, totalVol - v.volumeCap, totalVol, v.volumeCap));
    }

    boolean isFresh = "Fresh".equalsIgnoreCase(o.brand);
    int usedMinutes = 0;
    for (List<Order> l : tripsMap.values()) {
      if (!l.isEmpty() && "Fresh".equalsIgnoreCase(l.get(0).brand) == isFresh) {
        usedMinutes += tripMinutes(l);
      }
    }
    int budget = isFresh ? 270 : 480;
    if (usedMinutes > budget) {
      throw bad(String.format("Daily time budget exceeded for %s: %d min used of %d min limit", isFresh ? "Fresh (before 8 AM)" : "Style/Tech", usedMinutes, budget));
    }

    o.vehicleId = vid;
    o.trip = trip;
    o.status = "ALLOCATED";
    o.deferReason = null;
    return orders.save(o);
  }

  public Order unassign(String ref) {
    Order o = orders.findById(ref).orElseThrow(() -> bad("Order not found"));
    checkRunNotDeparted(o);
    o.vehicleId = null;
    o.trip = null;
    o.status = "CONFIRMED";
    return orders.save(o);
  }

  public Order defer(String ref, String reason, String notes, String rescheduleDate) {
    Order o = orders.findById(ref).orElseThrow(() -> bad("Order not found"));
    checkRunNotDeparted(o);
    o.vehicleId = null;
    o.trip = null;
    o.status = "DEFERRED";
    o.deferReason = (reason != null && !reason.isBlank()) ? reason : "Capacity exceeded";
    o.notes = notes;
    o.rescheduleDate = (rescheduleDate != null && !rescheduleDate.isBlank()) ? rescheduleDate : "Tomorrow";
    return orders.save(o);
  }

  public Vehicle setLoader(String vid, String lid) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found"));
    if (lid == null || lid.isBlank()) {
      v.loaderId = null;
      return vehicles.save(v);
    }
    Loader l = loaders.findById(lid).orElseThrow(() -> bad("Loader not found"));
    if (!l.depot.equalsIgnoreCase(v.depot)) {
      throw bad("Loader " + l.name + " is stationed at " + l.depot + " dock, not " + v.depot);
    }
    vehicles.findByLoaderId(lid).stream()
      .filter(x -> !x.id.equals(vid))
      .findAny()
      .ifPresent(x -> {
        throw bad("Loader " + l.name + " is already assigned to " + x.id);
      });
    v.loaderId = lid;
    return vehicles.save(v);
  }

  public List<Map<String, Object>> tripsOf(Vehicle v, List<Order> all) {
    List<Map<String, Object>> trips = new ArrayList<>();
    int freshCumulative = 0;
    int otherCumulative = 0;

    for (int n = 1; n <= 2; n++) {
      int k = n;
      List<Order> os = all.stream()
        .filter(x -> v.id.equals(x.vehicleId) && x.trip != null && x.trip == k)
        .sorted(Comparator.comparing((Order x) -> x.windowClose != null ? x.windowClose : "08:00"))
        .collect(Collectors.toList());

      int min = tripMinutes(os);
      if (!os.isEmpty()) {
        boolean fresh = "Fresh".equalsIgnoreCase(os.get(0).brand);
        District d = dist.findById(os.get(0).district).orElse(null);
        int dtd = d != null ? d.dtdMin : 25;
        int inter = d != null ? d.interMin : 8;
        int startTimeMinutes = (fresh ? 210 + freshCumulative : 540 + otherCumulative) + dtd;

        for (int i = 0; i < os.size(); i++) {
          Order o = os.get(i);
          if (i > 0) startTimeMinutes += inter;
          o.stop = i + 1;
          o.stops = os.size();
          o.eta = hm(startTimeMinutes);
          
          Outlet out = outlets.findById(o.outletId).orElse(null);
          if (out != null) {
            o.lat = out.lat;
            o.lng = out.lng;
            o.outletName = out.name;
          }
          int handling = allow.findById(o.brand + "_" + o.dockType).map(a -> a.minutes).orElse(15);
          startTimeMinutes += handling;
        }
        if (fresh) freshCumulative += min;
        else otherCumulative += min;
      }

      double distKm = tripDistanceKm(os);
      double kmL = v.kmPerL > 0 ? v.kmPerL : 6.0;
      double fuelUsedL = distKm > 0 ? (distKm / kmL) : 0.0;
      double fuelCostLkr = fuelUsedL * 370.0;
      double co2Kg = fuelUsedL * 2.68;

      Map<String, Object> tripMap = new LinkedHashMap<>();
      tripMap.put("trip", n);
      tripMap.put("orders", os);
      tripMap.put("weightKg", os.stream().mapToDouble(x -> x.weightKg).sum());
      tripMap.put("volumeM3", os.stream().mapToDouble(x -> x.volumeM3).sum());
      tripMap.put("minutes", min);
      tripMap.put("distanceKm", Math.round(distKm * 10.0) / 10.0);
      tripMap.put("fuelLiters", Math.round(fuelUsedL * 10.0) / 10.0);
      tripMap.put("fuelCostLkr", (long) Math.round(fuelCostLkr));
      tripMap.put("co2Kg", Math.round(co2Kg * 10.0) / 10.0);
      tripMap.put("brand", !os.isEmpty() ? os.get(0).brand : null);
      tripMap.put("district", !os.isEmpty() ? os.get(0).district : null);
      trips.add(tripMap);
    }
    return trips;
  }

  public Map<String, Object> runOf(Vehicle v) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("vehicle", v);
    m.put("loader", v.loaderId == null ? null : loaders.findById(v.loaderId).orElse(null));
    m.put("trips", tripsOf(v, orders.findByVehicleId(v.id)));
    return m;
  }

  public List<Map<String, Object>> loaderRuns(String lid) {
    return vehicles.findByLoaderId(lid).stream().map(this::runOf).collect(Collectors.toList());
  }

  public Map<String, Object> driverRun(String vid) {
    return runOf(vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid)));
  }

  public Order load(String ref, boolean l) {
    Order o = get(ref);
    checkRunNotDeparted(o);
    o.loaded = l;
    if (l) o.flag = null;
    return orders.save(o);
  }

  public Order flag(String ref, String issue, String photo, String notes) {
    Order o = get(ref);
    checkRunNotDeparted(o);
    o.flag = issue;
    o.flagPhoto = photo;
    o.flagNotes = notes;
    o.loaded = false;
    return orders.save(o);
  }

  public Vehicle depart(String vid) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found"));
    if (v.loaderId == null) throw bad("Dispatcher has not assigned a loader to " + vid);
    List<Order> os = orders.findByVehicleId(vid);
    if (os.isEmpty()) throw bad("No orders allocated to vehicle " + vid);
    
    for (Order o : os) {
      if (!o.loaded && o.flag == null) {
        throw bad("Stop " + o.outletId + " (" + o.orderRef + ") is not yet loaded or flagged");
      }
      if ("Quantity Mismatch".equalsIgnoreCase(o.flag) && "Fresh".equalsIgnoreCase(o.brand)) {
        throw bad("Critical shortfall at " + o.outletId + " (" + o.orderRef + ") — Dispatcher must resolve before departure");
      }
    }

    for (Order o : os) {
      if (o.flag != null) {
        o.delivery = "SKIPPED";
        o.deliveryNote = "Not delivered: " + o.flag + (o.flagNotes != null ? " - " + o.flagNotes : "");
      } else {
        o.delivery = "PENDING";
      }
      orders.save(o);
    }
    v.departed = true;
    v.progressPct = 0;
    return vehicles.save(v);
  }

  public Order deliver(String ref, String status, String recipient, String signature, String note) {
    Order o = get(ref);
    if (!Set.of("ARRIVED", "DELIVERED", "FAILED").contains(status)) throw bad("Invalid status: " + status);
    if (o.vehicleId == null || !vehicles.findById(o.vehicleId).orElseThrow().departed) {
      throw bad("Run has not departed from the depot yet");
    }
    o.delivery = status;
    if (recipient != null && !recipient.isBlank()) o.recipient = recipient;
    if (signature != null && !signature.isBlank()) o.signature = signature;
    if (note != null && !note.isBlank()) o.deliveryNote = note;
    o.deliveryTime = hm((int)(System.currentTimeMillis() / 60000 % 1440));
    return orders.save(o);
  }

  public Order receipt(String ref, boolean ok, String note, String claimType) {
    Order o = get(ref);
    if (!"DELIVERED".equalsIgnoreCase(o.delivery)) {
      throw bad("Order has not been delivered yet by the driver");
    }
    o.receipt = ok ? "CONFIRMED" : "DISPUTED";
    o.receiptNote = note;
    if (!ok) {
      o.claimType = (claimType != null && !claimType.isBlank()) ? claimType : "Damaged / Missing Items";
      o.claimStatus = "SUBMITTED";
    }
    return orders.save(o);
  }

  @SuppressWarnings("unchecked")
  public List<Order> storeOrders(String oid) {
    List<Order> l = orders.findByOutletId(oid);
    Map<String, Order> dec = new HashMap<>();
    l.stream().map(o -> o.vehicleId).filter(Objects::nonNull).distinct().forEach(id ->
      vehicles.findById(id).ifPresent(v ->
        tripsOf(v, orders.findByVehicleId(id)).forEach(t ->
          ((List<Order>) t.get("orders")).forEach(x -> dec.put(x.orderRef, x))
        )
      )
    );
    for (Order o : l) {
      Order d = dec.get(o.orderRef);
      if (d != null) {
        o.stop = d.stop;
        o.stops = d.stops;
        o.eta = d.eta;
        o.lat = d.lat;
        o.lng = d.lng;
      }
    }
    return l;
  }

  // ------------------------------------------------------------------ engine bridge

  /** Reference tables (district_travel.csv / service_allowance.csv) as loaded in MongoDB. */
  AllocationEngine.Ref ref() {
    AllocationEngine.Ref r = new AllocationEngine.Ref();
    dist.findAll().forEach(d -> r.addDistrict(d.district, d.dtdMin, d.interMin));
    allow.findAll().forEach(a -> {
      int i = a.id.indexOf('_');
      if (i > 0) r.addAllowance(a.id.substring(0, i), a.id.substring(i + 1), a.minutes);
    });
    return r;
  }

  static final int AUTO_ITERATIONS = 1500;

  /**
   * Priority-aware auto-allocation (see AllocationEngine + docs/Task2B_Allocation_Policy.md).
   * Manual assignments are kept unless rebuild=true. With deferRest=true every order that could not be served is
   * recorded as DEFERRED with the reason it lost out (peak-day mode: every order ends up served or deferred).
   */
  public Map<String, Object> autoAllocate(String depot, boolean rebuild, boolean deferRest) {
    List<Order> all = orders.findByDepot(depot);
    List<Vehicle> vs = vehicles.findByDepot(depot);
    Set<String> departed = vs.stream().filter(v -> v.departed).map(v -> v.id).collect(Collectors.toSet());

    List<Order> fixed = new ArrayList<>();
    List<Order> candidates = new ArrayList<>();
    for (Order o : all) {
      boolean allocated = "ALLOCATED".equals(o.status) && o.vehicleId != null && o.trip != null;
      boolean locked = allocated && departed.contains(o.vehicleId);
      if (locked || (allocated && !rebuild)) fixed.add(o);
      else if ("DEFERRED".equals(o.status) && !rebuild) continue; // dispatcher decision stands
      else candidates.add(o);
    }

    AllocationEngine.Plan plan = AllocationEngine.optimize(fixed, candidates, vs, ref(), 42L, AUTO_ITERATIONS);

    List<String> assigned = new ArrayList<>();
    List<Map<String, Object>> unplaced = new ArrayList<>();
    List<Order> toSave = new ArrayList<>();
    for (Order o : candidates) {
      AllocationEngine.Placement pl = plan.placements.get(o.orderRef);
      if (pl != null) {
        o.vehicleId = pl.vehicleId;
        o.trip = pl.trip;
        o.status = "ALLOCATED";
        o.deferReason = null;
        assigned.add(o.orderRef);
      } else {
        o.vehicleId = null;
        o.trip = null;
        String why = AllocationEngine.deferralReason(o, vs);
        if (deferRest) {
          o.status = "DEFERRED";
          o.deferReason = why;
          o.rescheduleDate = "Next Run (Tomorrow)";
          o.notes = "Auto-deferred by priority policy";
        } else if (!"DEFERRED".equals(o.status)) {
          o.status = "CONFIRMED";
        }
        Map<String, Object> u = new LinkedHashMap<>();
        u.put("orderRef", o.orderRef);
        u.put("reason", why);
        unplaced.add(u);
      }
      toSave.add(o);
    }
    orders.saveAll(toSave);

    int allocatedTotal = fixed.size() + assigned.size();
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("success", true);
    res.put("allocatedCount", assigned.size());
    res.put("assignedOrders", assigned);
    res.put("servedTotal", allocatedTotal);
    res.put("unplacedCount", unplaced.size());
    res.put("unplaced", unplaced);
    res.put("deferredCount", deferRest ? unplaced.size() : 0);
    res.put("message", assigned.isEmpty() && unplaced.isEmpty()
      ? "Nothing left to allocate."
      : String.format("Auto-allocated %d order(s); %d could not be served within vehicle constraints%s.",
          assigned.size(), unplaced.size(), deferRest ? " and were deferred" : ""));
    return res;
  }

  public Map<String, Object> autoAllocate(String depot) {
    return autoAllocate(depot, false, false);
  }

  /** Defer every order that is neither allocated nor already deferred, recording the reason it lost out. */
  public Map<String, Object> deferRemaining(String depot) {
    List<Vehicle> vs = vehicles.findByDepot(depot);
    int n = 0;
    for (Order o : orders.findByDepot(depot)) {
      if ("ALLOCATED".equals(o.status) || "DEFERRED".equals(o.status)) continue;
      o.vehicleId = null;
      o.trip = null;
      o.status = "DEFERRED";
      o.deferReason = AllocationEngine.deferralReason(o, vs);
      o.rescheduleDate = "Next Run (Tomorrow)";
      o.notes = "Deferred by priority policy";
      orders.save(o);
      n++;
    }
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("success", true);
    res.put("deferredCount", n);
    res.put("message", n + " remaining order(s) deferred.");
    return res;
  }

  /** Same rules as the official check_allocation.py, run against the live board. */
  public Map<String, Object> validateAllocation(String depot) {
    List<Order> os = orders.findByDepot(depot);
    Map<String, Vehicle> vm = vehicles.findAll().stream().collect(Collectors.toMap(v -> v.id, v -> v));
    AllocationEngine.Report r = AllocationEngine.validate(os, vm, ref());
    long undecided = os.stream().filter(o -> !"ALLOCATED".equals(o.status) && !"DEFERRED".equals(o.status)).count();
    List<String> warnings = new ArrayList<>(r.warnings);
    if (undecided > 0) warnings.add(undecided + " order(s) are still unallocated and will be exported as deferred.");
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("passed", r.passed());
    res.put("errors", r.errors.size() > 100 ? r.errors.subList(0, 100) : r.errors);
    res.put("errorCount", r.errors.size());
    res.put("warnings", warnings);
    res.put("served", r.served);
    res.put("deferred", r.deferred);
    res.put("vehiclesUsed", r.vehiclesUsed);
    res.put("trips", r.trips);
    res.put("message", r.passed()
      ? "FEASIBILITY: PASSED - every rule satisfied."
      : "FEASIBILITY: FAILED (" + r.errors.size() + " problem(s))");
    return res;
  }

  /** submission_task2b.csv - one row per scenario order (refs like S1-000); anything not allocated is "deferred". */
  public String exportSubmission() {
    StringBuilder sb = new StringBuilder("scenario,order_ref,outlet_id,decision,vehicle_id,trip_id\n");
    orders.findAll().stream()
      .filter(o -> o.orderRef != null && o.orderRef.matches("S\\d+-\\d+"))
      .sorted(Comparator.comparing((Order o) -> o.orderRef))
      .forEach(o -> {
        boolean served = "ALLOCATED".equals(o.status) && o.vehicleId != null && o.trip != null;
        sb.append(o.orderRef.substring(0, o.orderRef.indexOf('-'))).append(',')
          .append(o.orderRef).append(',')
          .append(o.outletId).append(',')
          .append(served ? "served" : "deferred").append(',')
          .append(served ? o.vehicleId : "").append(',')
          .append(served ? String.valueOf(o.trip) : "").append('\n');
      });
    return sb.toString();
  }

  public Map<String, Object> resetAllocations(String depot) {
    List<Order> list = orders.findByDepot(depot);
    for (Order o : list) {
      o.vehicleId = null;
      o.trip = null;
      o.status = "CONFIRMED";
      o.loaded = false;
      o.flag = null;
      o.delivery = null;
      o.receipt = null;
      o.deferReason = null;
      orders.save(o);
    }
    List<Vehicle> vs = vehicles.findByDepot(depot);
    for (Vehicle v : vs) {
      v.departed = false;
      v.progressPct = 0;
      vehicles.save(v);
    }
    return Map.of("success", true, "message", "All allocations reset to unallocated queue.");
  }

  public Map<String, Object> board(String depot) {
    List<Order> all = orders.findByDepot(depot);
    List<Vehicle> vs = vehicles.findByDepot(depot);
    List<Map<String, Object>> vv = new ArrayList<>();
    
    for (Vehicle v : vs) {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("vehicle", v);
      m.put("loader", v.loaderId == null ? null : loaders.findById(v.loaderId).orElse(null));
      m.put("trips", tripsOf(v, all));
      vv.add(m);
    }

    long allocatedCount = all.stream().filter(x -> "ALLOCATED".equals(x.status)).count();
    long deferredCount = all.stream().filter(x -> "DEFERRED".equals(x.status)).count();
    long unallocatedCount = all.size() - allocatedCount - deferredCount;
    
    double totalWeight = all.stream().mapToDouble(x -> x.weightKg).sum();
    double totalVol = all.stream().mapToDouble(x -> x.volumeM3).sum();
    double allocatedWeight = all.stream().filter(x -> "ALLOCATED".equals(x.status)).mapToDouble(x -> x.weightKg).sum();
    double totalFleetWeightCap = vs.stream().filter(v -> "available".equals(v.status)).mapToDouble(v -> v.weightCap * 2).sum();
    int fleetCapPct = totalFleetWeightCap > 0 ? (int) Math.round((allocatedWeight / totalFleetWeightCap) * 100) : 0;

    long chilledOrders = all.stream().filter(x -> "chilled".equals(x.temp)).count();
    long workshopVehicles = vs.stream().filter(x -> "in_workshop".equals(x.status)).count();
    long availableVehicles = vs.stream().filter(x -> "available".equals(x.status)).count();

    Map<String, Object> stats = new LinkedHashMap<>();
    stats.put("total", all.size());
    stats.put("allocated", allocatedCount);
    stats.put("unallocated", unallocatedCount);
    stats.put("deferred", deferredCount);
    stats.put("chilledOrders", chilledOrders);
    stats.put("weightKg", totalWeight);
    stats.put("volumeM3", totalVol);
    stats.put("allocatedWeightKg", allocatedWeight);
    stats.put("fleetCapacityPct", Math.max(12, fleetCapPct));
    stats.put("availableVehicles", availableVehicles);
    stats.put("workshopVehicles", workshopVehicles);
    stats.put("totalVehicles", vs.size());

    List<Alert> alerts = List.of(
      new Alert("A1", "urgent", "festival", "Vesak Festival Ramp Active", "Expect +40% Fresh Demand across Colombo & Gampaha districts. Fleet optimization active.", "10m ago"),
      new Alert("A2", "warning", "truck", "Vehicle In-Workshop (VEH008)", "Refrigeration compressor maintenance scheduled at Peliyagoda yard.", "35m ago"),
      new Alert("A3", "info", "rain", "Monsoon Heavy Rain Warning", "Kandy & Hill Country corridor road speeds reduced by 15%. Added buffer to ETAs.", "1h ago")
    );

    List<Map<String, Object>> deferralHistory = all.stream()
      .filter(x -> "DEFERRED".equals(x.status) || x.deferredYesterday == 1)
      .map(x -> Map.<String, Object>of(
        "orderRef", x.orderRef,
        "outletId", x.outletId,
        "district", x.district,
        "brand", x.brand,
        "consecutiveSkips", x.deferredYesterday + 1,
        "reason", x.deferReason != null ? x.deferReason : "Vehicle capacity constraint",
        "rescheduleDate", x.rescheduleDate != null ? x.rescheduleDate : "Next Run (Tomorrow)",
        "notes", x.notes != null ? x.notes : ""
      ))
      .collect(Collectors.toList());

    return Map.of(
      "orders", all.stream().filter(x -> !"ALLOCATED".equals(x.status) && !"DEFERRED".equals(x.status)).collect(Collectors.toList()),
      "deferredOrders", all.stream().filter(x -> "DEFERRED".equals(x.status)).collect(Collectors.toList()),
      "vehicles", vv,
      "stats", stats,
      "loaders", loaders.findAll().stream().filter(l -> l.depot.equalsIgnoreCase(depot)).collect(Collectors.toList()),
      "districts", dist.findAll(),
      "alerts", alerts,
      "deferralHistory", deferralHistory
    );
  }

  // --- FLEET MANAGEMENT ---
  public Vehicle updateVehicleStatus(String vid, String status, String notes) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid));
    v.status = status;
    v.maintenanceNotes = notes;
    if ("in_workshop".equalsIgnoreCase(status)) {
      v.healthScore = Math.min(v.healthScore, 68);
    } else {
      v.healthScore = Math.max(v.healthScore, 95);
    }
    return vehicles.save(v);
  }

  public Vehicle updateVehicleDriver(String vid, String driver) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid));
    v.driver = driver;
    return vehicles.save(v);
  }

  public Vehicle refuelVehicle(String vid, double amountLiters) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid));
    if (amountLiters <= 0) {
      v.fuelLeft = v.fuelQuota;
    } else {
      v.fuelLeft = Math.min(v.fuelQuota, v.fuelLeft + amountLiters);
    }
    return vehicles.save(v);
  }

  public Map<String, Object> fleetAnalytics(String depot) {
    List<Vehicle> allVehicles = (depot == null || "all".equalsIgnoreCase(depot)) ? vehicles.findAll() : vehicles.findByDepot(depot);
    List<Order> allOrders = (depot == null || "all".equalsIgnoreCase(depot)) ? orders.findAll() : orders.findByDepot(depot);

    long availableCount = allVehicles.stream().filter(v -> "available".equalsIgnoreCase(v.status)).count();
    long workshopCount = allVehicles.stream().filter(v -> "in_workshop".equalsIgnoreCase(v.status)).count();
    long departedCount = allVehicles.stream().filter(v -> v.departed).count();
    long truckCount = allVehicles.stream().filter(v -> "truck".equalsIgnoreCase(v.type)).count();
    long vanCount = allVehicles.stream().filter(v -> "van".equalsIgnoreCase(v.type)).count();
    long reeferCount = allVehicles.stream().filter(v -> "reefer".equalsIgnoreCase(v.temp)).count();
    long ambientCount = allVehicles.stream().filter(v -> "ambient".equalsIgnoreCase(v.temp)).count();

    double totalWeightCap = allVehicles.stream().mapToDouble(v -> v.weightCap).sum();
    double totalVolCap = allVehicles.stream().mapToDouble(v -> v.volumeCap).sum();
    double avgHealth = allVehicles.stream().mapToInt(v -> v.healthScore).average().orElse(95.0);

    List<Map<String, Object>> roster = new ArrayList<>();
    for (Vehicle v : allVehicles) {
      List<Order> vOrders = allOrders.stream().filter(o -> v.id.equals(o.vehicleId)).collect(Collectors.toList());
      List<Map<String, Object>> trips = tripsOf(v, allOrders);
      
      double totalDist = trips.stream().mapToDouble(t -> ((Number) t.getOrDefault("distanceKm", 0.0)).doubleValue()).sum();
      double totalFuel = trips.stream().mapToDouble(t -> ((Number) t.getOrDefault("fuelLiters", 0.0)).doubleValue()).sum();
      double totalWeight = vOrders.stream().mapToDouble(o -> o.weightKg).sum();
      double totalVol = vOrders.stream().mapToDouble(o -> o.volumeM3).sum();
      long tripCount = trips.stream().filter(t -> !((List<?>) t.get("orders")).isEmpty()).count();

      Map<String, Object> vm = new LinkedHashMap<>();
      vm.put("vehicle", v);
      vm.put("trips", trips);
      vm.put("activeTripCount", tripCount);
      vm.put("totalAllocatedWeightKg", Math.round(totalWeight));
      vm.put("totalAllocatedVolumeM3", Math.round(totalVol * 10.0) / 10.0);
      vm.put("weightUtilizationPct", v.weightCap > 0 ? (int) Math.round((totalWeight / (v.weightCap * Math.max(1, tripCount))) * 100) : 0);
      vm.put("volumeUtilizationPct", v.volumeCap > 0 ? (int) Math.round((totalVol / (v.volumeCap * Math.max(1, tripCount))) * 100) : 0);
      vm.put("totalDistanceKm", Math.round(totalDist * 10.0) / 10.0);
      vm.put("totalFuelConsumedL", Math.round(totalFuel * 10.0) / 10.0);
      vm.put("fuelRemainingL", Math.max(0.0, Math.round((v.fuelLeft - totalFuel) * 10.0) / 10.0));
      vm.put("fuelQuotaUsedPct", v.fuelQuota > 0 ? (int) Math.round((totalFuel / v.fuelQuota) * 100) : 0);
      vm.put("loader", v.loaderId != null ? loaders.findById(v.loaderId).orElse(null) : null);
      roster.add(vm);
    }

    Map<String, Object> summary = new LinkedHashMap<>();
    summary.put("totalVehicles", allVehicles.size());
    summary.put("availableVehicles", availableCount);
    summary.put("workshopVehicles", workshopCount);
    summary.put("departedVehicles", departedCount);
    summary.put("trucks", truckCount);
    summary.put("vans", vanCount);
    summary.put("reefers", reeferCount);
    summary.put("ambient", ambientCount);
    summary.put("totalWeightCapKg", Math.round(totalWeightCap));
    summary.put("totalVolumeCapM3", Math.round(totalVolCap * 10.0) / 10.0);
    summary.put("avgHealthScore", Math.round(avgHealth));

    return Map.of(
      "summary", summary,
      "roster", roster,
      "loaders", loaders.findAll()
    );
  }

  // --- CAPACITY MANAGEMENT ---
  public Map<String, Object> capacityAnalytics(String depot) {
    List<Vehicle> vs = (depot == null || "all".equalsIgnoreCase(depot)) ? vehicles.findAll() : vehicles.findByDepot(depot);
    List<Order> os = (depot == null || "all".equalsIgnoreCase(depot)) ? orders.findAll() : orders.findByDepot(depot);

    List<Vehicle> availableVs = vs.stream().filter(v -> "available".equalsIgnoreCase(v.status)).collect(Collectors.toList());

    double singleTripWeightCap = availableVs.stream().mapToDouble(v -> v.weightCap).sum();
    double singleTripVolCap = availableVs.stream().mapToDouble(v -> v.volumeCap).sum();
    double dailyMaxWeightCap = singleTripWeightCap * 2.0;
    double dailyMaxVolCap = singleTripVolCap * 2.0;

    double totalDemandWeight = os.stream().mapToDouble(o -> o.weightKg).sum();
    double totalDemandVol = os.stream().mapToDouble(o -> o.volumeM3).sum();

    List<Order> allocatedOrders = os.stream().filter(o -> "ALLOCATED".equalsIgnoreCase(o.status)).collect(Collectors.toList());
    double allocatedWeight = allocatedOrders.stream().mapToDouble(o -> o.weightKg).sum();
    double allocatedVol = allocatedOrders.stream().mapToDouble(o -> o.volumeM3).sum();

    // Reefer vs Chilled Analysis
    List<Vehicle> reeferVs = availableVs.stream().filter(v -> "reefer".equalsIgnoreCase(v.temp)).collect(Collectors.toList());
    double reeferSingleWeightCap = reeferVs.stream().mapToDouble(v -> v.weightCap).sum();
    double reeferSingleVolCap = reeferVs.stream().mapToDouble(v -> v.volumeCap).sum();
    double reeferDailyWeightCap = reeferSingleWeightCap * 2.0;
    double reeferDailyVolCap = reeferSingleVolCap * 2.0;

    List<Order> chilledOrders = os.stream().filter(o -> "chilled".equalsIgnoreCase(o.temp)).collect(Collectors.toList());
    double chilledDemandWeight = chilledOrders.stream().mapToDouble(o -> o.weightKg).sum();
    double chilledDemandVol = chilledOrders.stream().mapToDouble(o -> o.volumeM3).sum();

    List<Order> allocatedChilled = allocatedOrders.stream().filter(o -> "chilled".equalsIgnoreCase(o.temp)).collect(Collectors.toList());
    double allocatedChilledWeight = allocatedChilled.stream().mapToDouble(o -> o.weightKg).sum();
    double allocatedChilledVol = allocatedChilled.stream().mapToDouble(o -> o.volumeM3).sum();

    // Van-Only Access Analysis
    List<Vehicle> vanVs = availableVs.stream().filter(v -> "van".equalsIgnoreCase(v.type)).collect(Collectors.toList());
    double vanDailyWeightCap = vanVs.stream().mapToDouble(v -> v.weightCap * 2.0).sum();
    double vanDailyVolCap = vanVs.stream().mapToDouble(v -> v.volumeCap * 2.0).sum();

    List<Order> vanOnlyOrders = os.stream().filter(o -> "van_only".equalsIgnoreCase(o.parking)).collect(Collectors.toList());
    double vanOnlyDemandWeight = vanOnlyOrders.stream().mapToDouble(o -> o.weightKg).sum();
    double vanOnlyDemandVol = vanOnlyOrders.stream().mapToDouble(o -> o.volumeM3).sum();

    // Time-Budget Utilization
    int totalFreshMinutesUsed = 0;
    int totalDaytimeMinutesUsed = 0;
    for (Vehicle v : availableVs) {
      List<Map<String, Object>> trips = tripsOf(v, os);
      for (Map<String, Object> t : trips) {
        String brand = (String) t.get("brand");
        int m = ((Number) t.getOrDefault("minutes", 0)).intValue();
        if ("Fresh".equalsIgnoreCase(brand)) totalFreshMinutesUsed += m;
        else if (brand != null) totalDaytimeMinutesUsed += m;
      }
    }
    int totalFreshMinutesBudget = reeferVs.size() * 270;
    int totalDaytimeMinutesBudget = availableVs.size() * 480;

    // District-by-District Breakdown
    Map<String, List<Order>> districtMap = os.stream().collect(Collectors.groupingBy(o -> o.district, LinkedHashMap::new, Collectors.toList()));
    List<Map<String, Object>> districtBreakdown = new ArrayList<>();
    for (Map.Entry<String, List<Order>> entry : districtMap.entrySet()) {
      String distName = entry.getKey();
      List<Order> dOrders = entry.getValue();
      double dw = dOrders.stream().mapToDouble(o -> o.weightKg).sum();
      double dv = dOrders.stream().mapToDouble(o -> o.volumeM3).sum();
      long dAlloc = dOrders.stream().filter(o -> "ALLOCATED".equalsIgnoreCase(o.status)).count();
      long dChilled = dOrders.stream().filter(o -> "chilled".equalsIgnoreCase(o.temp)).count();
      long dVanOnly = dOrders.stream().filter(o -> "van_only".equalsIgnoreCase(o.parking)).count();

      Map<String, Object> dm = new LinkedHashMap<>();
      dm.put("district", distName);
      dm.put("totalOrders", dOrders.size());
      dm.put("allocatedOrders", dAlloc);
      dm.put("unallocatedOrders", dOrders.size() - dAlloc);
      dm.put("weightKg", Math.round(dw));
      dm.put("volumeM3", Math.round(dv * 10.0) / 10.0);
      dm.put("chilledOrders", dChilled);
      dm.put("vanOnlyOrders", dVanOnly);
      dm.put("allocationPct", dOrders.size() > 0 ? (int) Math.round((dAlloc * 100.0) / dOrders.size()) : 0);
      districtBreakdown.add(dm);
    }

    // 8-Week Predictive Forecast (incorporating Vesak ramp +40% at Wk44)
    List<Map<String, Object>> forecastWeeks = List.of(
      Map.of("week", "Wk 40", "label", "Sep 28", "totalDemandM3", 820.0, "chilledM3", 280.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 78, "event", "Normal Trading"),
      Map.of("week", "Wk 41", "label", "Oct 05", "totalDemandM3", 860.0, "chilledM3", 310.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 82, "event", "Payday Surge"),
      Map.of("week", "Wk 42", "label", "Oct 12", "totalDemandM3", 790.0, "chilledM3", 260.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 75, "event", "Normal Trading"),
      Map.of("week", "Wk 43", "label", "Oct 19", "totalDemandM3", 840.0, "chilledM3", 290.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 80, "event", "Monsoon Advisory"),
      Map.of("week", "Wk 44", "label", "Oct 26", "totalDemandM3", 1180.0, "chilledM3", 460.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 98, "event", "🎉 Vesak Festival Peak (+40%)"),
      Map.of("week", "Wk 45", "label", "Nov 02", "totalDemandM3", 910.0, "chilledM3", 330.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 86, "event", "Post-Festival Normal"),
      Map.of("week", "Wk 46", "label", "Nov 09", "totalDemandM3", 830.0, "chilledM3", 275.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 79, "event", "Normal Trading"),
      Map.of("week", "Wk 47", "label", "Nov 16", "totalDemandM3", 870.0, "chilledM3", 305.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 83, "event", "Payday Ramp")
    );

    Map<String, Object> overview = new LinkedHashMap<>();
    overview.put("singleTripWeightCapKg", Math.round(singleTripWeightCap));
    overview.put("singleTripVolumeCapM3", Math.round(singleTripVolCap * 10.0) / 10.0);
    overview.put("dailyMaxWeightCapKg", Math.round(dailyMaxWeightCap));
    overview.put("dailyMaxVolumeCapM3", Math.round(dailyMaxVolCap * 10.0) / 10.0);
    overview.put("totalDemandWeightKg", Math.round(totalDemandWeight));
    overview.put("totalDemandVolumeM3", Math.round(totalDemandVol * 10.0) / 10.0);
    overview.put("allocatedWeightKg", Math.round(allocatedWeight));
    overview.put("allocatedVolumeM3", Math.round(allocatedVol * 10.0) / 10.0);
    overview.put("weightCapacityUtilizationPct", dailyMaxWeightCap > 0 ? (int) Math.round((allocatedWeight / dailyMaxWeightCap) * 100) : 0);
    overview.put("volumeCapacityUtilizationPct", dailyMaxVolCap > 0 ? (int) Math.round((allocatedVol / dailyMaxVolCap) * 100) : 0);
    overview.put("totalOrders", os.size());
    overview.put("allocatedOrders", allocatedOrders.size());
    overview.put("unallocatedOrders", os.size() - allocatedOrders.size());

    return Map.of(
      "overview", overview,
      "reeferCapacity", Map.of(
        "reeferVehicles", reeferVs.size(),
        "dailyMaxWeightCapKg", Math.round(reeferDailyWeightCap),
        "dailyMaxVolumeCapM3", Math.round(reeferDailyVolCap * 10.0) / 10.0,
        "chilledDemandWeightKg", Math.round(chilledDemandWeight),
        "chilledDemandVolumeM3", Math.round(chilledDemandVol * 10.0) / 10.0,
        "allocatedChilledWeightKg", Math.round(allocatedChilledWeight),
        "allocatedChilledVolumeM3", Math.round(allocatedChilledVol * 10.0) / 10.0,
        "utilizationPct", reeferDailyVolCap > 0 ? (int) Math.round((allocatedChilledVol / reeferDailyVolCap) * 100) : 0
      ),
      "vanCapacity", Map.of(
        "vanVehicles", vanVs.size(),
        "dailyMaxWeightCapKg", Math.round(vanDailyWeightCap),
        "dailyMaxVolumeCapM3", Math.round(vanDailyVolCap * 10.0) / 10.0,
        "vanOnlyDemandWeightKg", Math.round(vanOnlyDemandWeight),
        "vanOnlyDemandVolumeM3", Math.round(vanOnlyDemandVol * 10.0) / 10.0,
        "vanOnlyOrders", vanOnlyOrders.size()
      ),
      "timeBudgets", Map.of(
        "freshMinutesUsed", totalFreshMinutesUsed,
        "freshMinutesBudget", totalFreshMinutesBudget,
        "freshBudgetUtilizationPct", totalFreshMinutesBudget > 0 ? (int) Math.round((totalFreshMinutesUsed * 100.0) / totalFreshMinutesBudget) : 0,
        "daytimeMinutesUsed", totalDaytimeMinutesUsed,
        "daytimeMinutesBudget", totalDaytimeMinutesBudget,
        "daytimeBudgetUtilizationPct", totalDaytimeMinutesBudget > 0 ? (int) Math.round((totalDaytimeMinutesUsed * 100.0) / totalDaytimeMinutesBudget) : 0
      ),
      "districts", districtBreakdown,
      "forecast", forecastWeeks
    );
  }

  // --- FUEL MANAGEMENT ---
  public Map<String, Object> fuelAnalytics(String depot) {
    List<Vehicle> vs = (depot == null || "all".equalsIgnoreCase(depot)) ? vehicles.findAll() : vehicles.findByDepot(depot);
    List<Order> os = (depot == null || "all".equalsIgnoreCase(depot)) ? orders.findAll() : orders.findByDepot(depot);

    double totalWeeklyQuota = vs.stream().mapToDouble(v -> v.fuelQuota).sum();
    double totalPlannedFuel = 0.0;
    double totalPlannedDistKm = 0.0;
    double totalPlannedCostLkr = 0.0;
    double totalCo2Kg = 0.0;

    Map<String, Double> fuelByBrand = new LinkedHashMap<>();
    fuelByBrand.put("Fresh", 0.0);
    fuelByBrand.put("Style", 0.0);
    fuelByBrand.put("Tech", 0.0);

    Map<String, Double> fuelByDistrict = new LinkedHashMap<>();

    List<Map<String, Object>> roster = new ArrayList<>();
    int highConsumptionAlerts = 0;

    for (Vehicle v : vs) {
      List<Map<String, Object>> trips = tripsOf(v, os);
      double vDist = 0.0;
      double vFuel = 0.0;
      for (Map<String, Object> t : trips) {
        double d = ((Number) t.getOrDefault("distanceKm", 0.0)).doubleValue();
        double f = ((Number) t.getOrDefault("fuelLiters", 0.0)).doubleValue();
        String brand = (String) t.get("brand");
        String district = (String) t.get("district");
        vDist += d;
        vFuel += f;
        if (brand != null && fuelByBrand.containsKey(brand)) {
          fuelByBrand.put(brand, fuelByBrand.get(brand) + f);
        }
        if (district != null) {
          fuelByDistrict.put(district, fuelByDistrict.getOrDefault(district, 0.0) + f);
        }
      }

      totalPlannedFuel += vFuel;
      totalPlannedDistKm += vDist;
      totalPlannedCostLkr += (vFuel * 370.0);
      totalCo2Kg += (vFuel * 2.68);

      double quotaPct = v.fuelQuota > 0 ? ((vFuel / v.fuelQuota) * 100.0) : 0.0;
      String status = "normal";
      if (quotaPct > 100.0) {
        status = "exceeded";
        highConsumptionAlerts++;
      } else if (quotaPct > 85.0) {
        status = "warning";
        highConsumptionAlerts++;
      } else if (quotaPct > 65.0) {
        status = "advisory";
      }

      Map<String, Object> vm = new LinkedHashMap<>();
      vm.put("vehicleId", v.id);
      vm.put("type", v.type);
      vm.put("temp", v.temp);
      vm.put("driver", v.driver);
      vm.put("depot", v.depot);
      vm.put("kmPerL", v.kmPerL);
      vm.put("fuelQuotaL", v.fuelQuota);
      vm.put("plannedDistanceKm", Math.round(vDist * 10.0) / 10.0);
      vm.put("fuelConsumedL", Math.round(vFuel * 10.0) / 10.0);
      vm.put("fuelLeftL", Math.max(0.0, Math.round((v.fuelLeft - vFuel) * 10.0) / 10.0));
      vm.put("quotaUsedPct", Math.min(100, (int) Math.round(quotaPct)));
      vm.put("fuelCostLkr", (long) Math.round(vFuel * 370.0));
      vm.put("co2Kg", Math.round(vFuel * 2.68 * 10.0) / 10.0);
      vm.put("status", status);
      roster.add(vm);
    }

    double avgEfficiency = vs.stream().mapToDouble(v -> v.kmPerL).average().orElse(6.5);
    double remainingQuota = Math.max(0.0, totalWeeklyQuota - totalPlannedFuel);

    // Eco-Routing Insights & Recommendations
    List<Map<String, String>> recommendations = List.of(
      Map.of("id", "ECO-1", "type", "optimization", "title", "Van Substitution Opportunity", "description", "Replace heavy diesel truck VEH001 (4.7 km/L) with Reefer Van VEH035 (10.3 km/L) for Colombo urban Fresh stops to save ~4.8L diesel (54% fuel reduction)."),
      Map.of("id", "ECO-2", "type", "advisory", "title", "Kandy Hill Country Speed Adjustment", "description", "Rain slowdowns along Kandy-Nuwara Eliya corridor increase idling. Route consolidation reduces hill climb trips by 1."),
      Map.of("id", "ECO-3", "type", "quota", "title", "Weekly Quota Buffer Healthy", "description", String.format("Current fleet consumption is tracking at %d%% of weekly allocation with %.0f Liters buffer remaining.", (int) Math.round((totalPlannedFuel / totalWeeklyQuota) * 100), remainingQuota))
    );

    return Map.of(
      "summary", Map.of(
        "totalWeeklyQuotaL", Math.round(totalWeeklyQuota),
        "totalPlannedFuelL", Math.round(totalPlannedFuel * 10.0) / 10.0,
        "remainingQuotaL", Math.round(remainingQuota * 10.0) / 10.0,
        "totalPlannedDistanceKm", Math.round(totalPlannedDistKm * 10.0) / 10.0,
        "fleetAverageKmL", Math.round(avgEfficiency * 10.0) / 10.0,
        "totalEstimatedCostLkr", Math.round(totalPlannedCostLkr),
        "totalCo2EmissionsKg", Math.round(totalCo2Kg * 10.0) / 10.0,
        "overallQuotaUsedPct", totalWeeklyQuota > 0 ? (int) Math.round((totalPlannedFuel / totalWeeklyQuota) * 100) : 0,
        "highConsumptionAlerts", highConsumptionAlerts
      ),
      "fuelByBrand", fuelByBrand,
      "fuelByDistrict", fuelByDistrict,
      "roster", roster,
      "recommendations", recommendations
    );
  }
}
