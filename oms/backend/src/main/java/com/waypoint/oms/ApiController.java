package com.waypoint.oms;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import com.waypoint.oms.Models.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ApiController {
  final AllocationService s;
  final OrderRepo orders;
  final OutletRepo outlets;
  final UserRepo users;
  final OmsApplication app;

  public ApiController(AllocationService s, OrderRepo o, OutletRepo ou, UserRepo u, OmsApplication app) {
    this.s = s;
    this.orders = o;
    this.outlets = ou;
    this.users = u;
    this.app = app;
  }

  @GetMapping("/board")
  public Map<String, Object> board(@RequestParam(defaultValue = "Peliyagoda") String depot) {
    return s.board(depot);
  }

  @PostMapping("/allocations")
  public Order assign(@RequestBody Map<String, Object> b) {
    String orderRef = (String) b.get("orderRef");
    String vehicleId = (String) b.get("vehicleId");
    int trip = b.get("trip") != null ? ((Number) b.get("trip")).intValue() : 1;
    return s.assign(orderRef, vehicleId, trip);
  }

  @DeleteMapping("/allocations/{ref}")
  public Order unassign(@PathVariable String ref) {
    return s.unassign(ref);
  }

  /** rebuild=true re-plans everything not yet departed; deferRest=true records every unserved order as DEFERRED. */
  @PostMapping("/allocations/auto")
  public Map<String, Object> autoAllocate(@RequestParam(defaultValue = "Peliyagoda") String depot,
                                          @RequestParam(defaultValue = "false") boolean rebuild,
                                          @RequestParam(defaultValue = "false") boolean deferRest) {
    return s.autoAllocate(depot, rebuild, deferRest);
  }

  @PostMapping("/allocations/defer-rest")
  public Map<String, Object> deferRest(@RequestParam(defaultValue = "Peliyagoda") String depot) {
    return s.deferRemaining(depot);
  }

  /** Runs the same 7 feasibility rules as the official check_allocation.py against the live allocation. */
  @GetMapping("/allocations/validate")
  public Map<String, Object> validate(@RequestParam(defaultValue = "Peliyagoda") String depot) {
    return s.validateAllocation(depot);
  }

  /** Task 2B submission file (submission_task2b.csv). */
  @GetMapping("/allocations/export")
  public ResponseEntity<String> export() {
    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"submission_task2b.csv\"")
      .contentType(new MediaType("text", "csv"))
      .body(s.exportSubmission());
  }

  @PostMapping("/allocations/reset")
  public Map<String, Object> resetAllocations(@RequestParam(defaultValue = "Peliyagoda") String depot) {
    return s.resetAllocations(depot);
  }

  @PostMapping("/orders/{ref}/defer")
  public Order defer(@PathVariable String ref, @RequestBody(required = false) Map<String, String> b) {
    String reason = (b != null && b.containsKey("reason")) ? b.get("reason") : "Capacity exceeded";
    String notes = (b != null) ? b.get("notes") : "";
    String rescheduleDate = (b != null) ? b.get("rescheduleDate") : "Tomorrow";
    return s.defer(ref, reason, notes, rescheduleDate);
  }

  @PutMapping("/vehicles/{id}/loader")
  public Vehicle setLoader(@PathVariable String id, @RequestBody Map<String, String> b) {
    return s.setLoader(id, b.get("loaderId"));
  }

  @GetMapping("/outlets")
  public List<Outlet> outlets() {
    return outlets.findAll();
  }

  /** Store manager places an order; outlet metadata is copied from the master outlet. */
  @PostMapping("/orders")
  public Order place(@RequestBody Order in) {
    Outlet ou = outlets.findById(in.outletId).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Outlet not found: " + in.outletId));
    Order o = new Order();
    o.orderRef = "ORD" + (1000 + (int)(System.currentTimeMillis() % 9000));
    o.outletId = ou.id;
    o.brand = ou.brand;
    o.district = ou.district;
    o.depot = ou.depot;
    o.dockType = ou.dockType;
    o.parking = ou.parking;
    o.mallWindow = ou.mallWindow;
    o.windowOpen = ou.windowOpen;
    o.windowClose = ou.windowClose;
    o.temp = "Fresh".equalsIgnoreCase(ou.brand) ? (in.temp != null ? in.temp : "ambient") : "ambient";
    o.units = in.units > 0 ? in.units : 15;
    o.weightKg = in.weightKg > 0 ? in.weightKg : 120.0;
    o.volumeM3 = in.volumeM3 > 0 ? in.volumeM3 : 0.8;
    o.status = "CONFIRMED";
    o.deferredYesterday = 0;
    o.daysSinceLastServed = 1;
    o.notes = in.notes;
    return orders.save(o);
  }

  @PostMapping("/login")
  public User login(@RequestBody Map<String, String> b) {
    String u = String.valueOf(b.get("username")).trim().toLowerCase();
    String p = String.valueOf(b.get("password")).trim();
    User user = users.findById(u).filter(x -> x.password.equals(p))
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
    User r = new User();
    r.id = user.id;
    r.name = user.name;
    r.role = user.role;
    r.outletId = user.outletId;
    r.loaderId = user.loaderId;
    r.vehicleId = user.vehicleId;
    return r;
  }

  // Loader API
  @GetMapping("/loader/{id}/runs")
  public List<Map<String, Object>> loaderRuns(@PathVariable String id) {
    return s.loaderRuns(id);
  }

  @PostMapping("/orders/{ref}/load")
  public Order load(@PathVariable String ref, @RequestBody Map<String, Boolean> b) {
    return s.load(ref, Boolean.TRUE.equals(b.get("loaded")));
  }

  @PostMapping("/orders/{ref}/flag")
  public Order flag(@PathVariable String ref, @RequestBody Map<String, String> b) {
    return s.flag(ref, b.get("issue"), b.get("photo"), b.get("notes"));
  }

  @PostMapping("/vehicles/{id}/depart")
  public Vehicle depart(@PathVariable String id) {
    return s.depart(id);
  }

  // Driver API
  @GetMapping("/driver/{vid}/run")
  public Map<String, Object> driverRun(@PathVariable String vid) {
    return s.driverRun(vid);
  }

  @PostMapping("/orders/{ref}/delivery")
  public Order delivery(@PathVariable String ref, @RequestBody Map<String, String> b) {
    return s.deliver(ref, b.get("status"), b.get("recipient"), b.get("signature"), b.get("note"));
  }

  // Store Manager API
  @GetMapping("/store/{oid}/orders")
  public List<Order> storeOrders(@PathVariable String oid) {
    return s.storeOrders(oid);
  }

  @PostMapping("/orders/{ref}/receipt")
  public Order receipt(@PathVariable String ref, @RequestBody Map<String, Object> b) {
    boolean ok = Boolean.TRUE.equals(b.get("ok"));
    String note = (String) b.get("note");
    String claimType = (String) b.get("claimType");
    return s.receipt(ref, ok, note, claimType);
  }

  // Fleet Management API
  @GetMapping("/fleet")
  public Map<String, Object> fleet(@RequestParam(defaultValue = "Peliyagoda") String depot) {
    return s.fleetAnalytics(depot);
  }

  @PostMapping("/vehicles/{id}/status")
  public Vehicle updateVehicleStatus(@PathVariable String id, @RequestBody Map<String, String> b) {
    return s.updateVehicleStatus(id, b.get("status"), b.get("notes"));
  }

  @PostMapping("/vehicles/{id}/driver")
  public Vehicle updateVehicleDriver(@PathVariable String id, @RequestBody Map<String, String> b) {
    return s.updateVehicleDriver(id, b.get("driver"));
  }

  @PostMapping("/vehicles/{id}/refuel")
  public Vehicle refuelVehicle(@PathVariable String id, @RequestBody Map<String, Number> b) {
    double amt = b.get("amount") != null ? b.get("amount").doubleValue() : 0.0;
    return s.refuelVehicle(id, amt);
  }

  // Capacity Planning & Management API
  @GetMapping("/capacity")
  public Map<String, Object> capacity(@RequestParam(defaultValue = "Peliyagoda") String depot) {
    return s.capacityAnalytics(depot);
  }

  // Fuel Management API
  @GetMapping("/fuel")
  public Map<String, Object> fuel(@RequestParam(defaultValue = "Peliyagoda") String depot) {
    return s.fuelAnalytics(depot);
  }

  // Reset database to initial seed data
  @PostMapping("/seed/reset")
  public Map<String, Object> resetSeed() {
    try {
      app.forceSeed();
      return Map.of("success", true, "message", "Database successfully re-seeded from initial datasets.");
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to reseed database: " + e.getMessage());
    }
  }
}
