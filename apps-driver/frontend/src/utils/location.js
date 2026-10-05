/**
 * Location helpers for Driver "Arrived Destination" logic.
 * Uses the browser Geolocation API + Haversine distance.
 */

/** Earth radius in meters */
const EARTH_RADIUS_M = 6_371_000;

/**
 * Haversine distance between two lat/lng points in meters.
 */
export const distanceMeters = (lat1, lng1, lat2, lng2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
};

/**
 * Default arrival radius (meters). Driver must be within this of the stop.
 */
export const DEFAULT_ARRIVAL_RADIUS_M = 100;

/**
 * Demo destination for Green Mart, Kandy (approx).
 * Replace with real stop coordinates from your backend.
 */
export const DEMO_DESTINATION = {
  lat: 7.2906,
  lng: 80.6337,
  name: "Green Mart",
  address: "No.125, Peradeniya Road, Kandy",
};

/**
 * Watch the driver's position and call onUpdate({ lat, lng, accuracy, error }).
 * Returns a cleanup function that clears the watch.
 */
export const watchDriverPosition = (onUpdate, options = {}) => {
  if (!navigator.geolocation) {
    onUpdate({
      lat: null,
      lng: null,
      accuracy: null,
      error: "Geolocation is not supported by this browser.",
      supported: false,
    });
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        error: null,
        supported: true,
      });
    },
    (err) => {
      onUpdate({
        lat: null,
        lng: null,
        accuracy: null,
        error: err.message || "Unable to read location.",
        supported: true,
      });
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5_000,
      timeout: 15_000,
      ...options,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
};

/**
 * Returns true if driver is within radiusM of the destination.
 */
export const hasReachedDestination = (
  driverLat,
  driverLng,
  destLat,
  destLng,
  radiusM = DEFAULT_ARRIVAL_RADIUS_M
) => {
  if (
    driverLat == null ||
    driverLng == null ||
    destLat == null ||
    destLng == null
  ) {
    return false;
  }
  return distanceMeters(driverLat, driverLng, destLat, destLng) <= radiusM;
};
