package com.waypoint.oms;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.servlet.config.annotation.*;
import java.util.List;
import com.waypoint.oms.Models.*;

@SpringBootApplication
public class OmsApplication {
  final OrderRepo orderRepo;
  final VehicleRepo vehicleRepo;
  final LoaderRepo loaderRepo;
  final OutletRepo outletRepo;
  final DistrictRepo districtRepo;
  final AllowanceRepo allowanceRepo;
  final UserRepo userRepo;
  final ObjectMapper objectMapper;

  public OmsApplication(OrderRepo o, VehicleRepo v, LoaderRepo l, OutletRepo ou, DistrictRepo d, AllowanceRepo al, UserRepo us, ObjectMapper m) {
    this.orderRepo = o;
    this.vehicleRepo = v;
    this.loaderRepo = l;
    this.outletRepo = ou;
    this.districtRepo = d;
    this.allowanceRepo = al;
    this.userRepo = us;
    this.objectMapper = m;
  }

  public static void main(String[] a) {
    SpringApplication.run(OmsApplication.class, a);
  }

  @Bean
  WebMvcConfigurer cors() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/**").allowedOrigins("*").allowedMethods("*").allowedHeaders("*");
      }
    };
  }

  @Bean
  CommandLineRunner seed() {
    return x -> {
      loadIfEmpty("orders", orderRepo, Order.class);
      loadIfEmpty("vehicles", vehicleRepo, Vehicle.class);
      loadIfEmpty("loaders", loaderRepo, Loader.class);
      loadIfEmpty("outlets", outletRepo, Outlet.class);
      loadIfEmpty("districts", districtRepo, District.class);
      loadIfEmpty("allowances", allowanceRepo, Allowance.class);
      loadIfEmpty("users", userRepo, User.class);
    };
  }

  public void forceSeed() throws Exception {
    orderRepo.deleteAll();
    vehicleRepo.deleteAll();
    loaderRepo.deleteAll();
    outletRepo.deleteAll();
    districtRepo.deleteAll();
    allowanceRepo.deleteAll();
    userRepo.deleteAll();

    forceLoad("orders", orderRepo, Order.class);
    forceLoad("vehicles", vehicleRepo, Vehicle.class);
    forceLoad("loaders", loaderRepo, Loader.class);
    forceLoad("outlets", outletRepo, Outlet.class);
    forceLoad("districts", districtRepo, District.class);
    forceLoad("allowances", allowanceRepo, Allowance.class);
    forceLoad("users", userRepo, User.class);
  }

  <T> void loadIfEmpty(String n, MongoRepository<T, String> r, Class<T> c) throws Exception {
    if (r.count() > 0) return;
    forceLoad(n, r, c);
  }

  <T> void forceLoad(String n, MongoRepository<T, String> r, Class<T> c) throws Exception {
    var is = getClass().getResourceAsStream("/seed/" + n + ".json");
    if (is == null) return;
    var t = objectMapper.getTypeFactory().constructCollectionType(List.class, c);
    r.saveAll(objectMapper.<List<T>>readValue(is, t));
  }
}
