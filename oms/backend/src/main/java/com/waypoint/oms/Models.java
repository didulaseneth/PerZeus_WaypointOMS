package com.waypoint.oms;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

public class Models {

  @Document("orders")
  public static class Order {
    @Id
    public String orderRef;
    public String outletId;
    public String brand;        // Fresh, Style, Tech
    public String district;
    public String depot;        // Peliyagoda, Kandy
    public String dockType;     // rear_dock, street, mall_bay
    public String parking;      // normal, van_only, mall_dock
    public String mallWindow;
    public String windowOpen;
    public String windowClose;
    public String temp;         // chilled, ambient
    public String status;       // CONFIRMED, ALLOCATED, DEFERRED
    public String vehicleId;
    public Integer trip;        // 1 or 2
    public String deferReason;
    public String rescheduleDate;
    public String notes;
    public int units;
    public int deferredYesterday;
    public int daysSinceLastServed;
    public double weightKg;
    public double volumeM3;
    
    // Loading workflow
    public boolean loaded;
    public String flag;         // Missing, Damaged, Quantity Mismatch
    public String flagPhoto;
    public String flagNotes;

    // Delivery workflow
    public String delivery;     // PENDING, ARRIVED, DELIVERED, FAILED, SKIPPED
    public String recipient;
    public String signature;
    public String deliveryNote;
    public String deliveryTime;

    // Receipt workflow
    public String receipt;      // CONFIRMED, DISPUTED
    public String receiptNote;
    public String claimType;
    public String claimStatus;

    // Transient computed fields for UI
    @Transient public Integer stop;
    @Transient public Integer stops;
    @Transient public String eta;
    @Transient public Double lat;
    @Transient public Double lng;
    @Transient public String outletName;
  }

  @Document("vehicles")
  public static class Vehicle {
    @Id
    public String id;           // VEH001 .. VEH060
    public String type;         // truck, van
    public String temp;         // reefer, ambient
    public String depot;        // Peliyagoda, Kandy
    public String status;       // available, in_workshop
    public String driver;
    public String loaderId;
    public double weightCap;
    public double volumeCap;
    public double kmPerL = 6.0;
    public double fuelQuota = 350.0;
    public double fuelLeft = 210.0;
    public String fuelType = "Diesel";
    public double odometerKm = 52000.0;
    public int healthScore = 95;
    public double nextServiceDueKm = 55000.0;
    public String maintenanceNotes;
    public String lastServiceDate;
    public boolean departed;
    public double currentLat;
    public double currentLng;
    public int progressPct = 0;
  }

  @Document("loaders")
  public static class Loader {
    @Id
    public String id;
    public String name;
    public String depot;
    public String phone;
    public String avatar;
  }

  @Document("outlets")
  public static class Outlet {
    @Id
    public String id;
    public String name;
    public String brand;
    public String district;
    public String depot;
    public String dockType;
    public String parking;
    public String mallWindow;
    public String windowOpen;
    public String windowClose;
    public double lat;
    public double lng;
    public String address;
  }

  @Document("districts")
  public static class District {
    @Id
    public String district;
    public String depot;
    public int dtdMin;
    public int interMin;
    public double dtdKm;
    public double interKm;
    public double lat;
    public double lng;
    public String roadClass;
    public double freeFlowKmh;
  }

  @Document("allowances")
  public static class Allowance {
    @Id
    public String id;           // e.g. Fresh_street, Style_rear_dock
    public int minutes;
  }

  @Document("users")
  public static class User {
    @Id
    public String id;
    public String name;
    public String password;
    public String role;         // DISPATCHER, LOADER, DRIVER, STORE_MANAGER
    public String outletId;
    public String loaderId;
    public String vehicleId;
  }

  public static class Alert {
    public String id;
    public String severity;    // urgent, warning, info
    public String icon;        // festival, rain, truck, alert
    public String title;
    public String message;
    public String time;
    public Alert(String id, String severity, String icon, String title, String message, String time) {
      this.id = id; this.severity = severity; this.icon = icon; this.title = title; this.message = message; this.time = time;
    }
  }
}
