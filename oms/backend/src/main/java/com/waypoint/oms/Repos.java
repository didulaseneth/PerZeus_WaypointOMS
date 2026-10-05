package com.waypoint.oms;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import com.waypoint.oms.Models.*;

interface OrderRepo extends MongoRepository<Order, String> {
  List<Order> findByVehicleId(String vehicleId);
  List<Order> findByDepot(String depot);
  List<Order> findByOutletId(String outletId);
  List<Order> findByStatus(String status);
}

interface VehicleRepo extends MongoRepository<Vehicle, String> {
  List<Vehicle> findByDepot(String depot);
  List<Vehicle> findByLoaderId(String loaderId);
  List<Vehicle> findByStatus(String status);
}

interface LoaderRepo extends MongoRepository<Loader, String> {
  List<Loader> findByDepot(String depot);
}

interface OutletRepo extends MongoRepository<Outlet, String> {
  List<Outlet> findByDepot(String depot);
  List<Outlet> findByBrand(String brand);
}

interface DistrictRepo extends MongoRepository<District, String> {
  List<District> findByDepot(String depot);
}

interface AllowanceRepo extends MongoRepository<Allowance, String> {}

interface UserRepo extends MongoRepository<User, String> {}
