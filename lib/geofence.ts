export interface Location {
  latitude: number;
  longitude: number;
}

export interface GeofenceConfig {
  center: Location;
  radiusInMeters: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Check if a location is within the geofence
 */
export function isWithinGeofence(
  userLocation: Location,
  geofenceConfig: GeofenceConfig
): boolean {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    geofenceConfig.center.latitude,
    geofenceConfig.center.longitude
  );

  console.log('[v0] Distance from office:', Math.round(distance), 'meters');
  return distance <= geofenceConfig.radiusInMeters;
}

/**
 * Get distance from geofence center
 */
export function getDistanceFromGeofence(
  userLocation: Location,
  geofenceConfig: GeofenceConfig
): number {
  return calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    geofenceConfig.center.latitude,
    geofenceConfig.center.longitude
  );
}

/**
 * Get geofence status for UI feedback
 */
export function getGeofenceStatus(
  userLocation: Location,
  geofenceConfig: GeofenceConfig
): {
  isInside: boolean;
  distance: number;
  status: 'inside' | 'warning' | 'outside';
} {
  const distance = getDistanceFromGeofence(userLocation, geofenceConfig);
  const isInside = isWithinGeofence(userLocation, geofenceConfig);
  const warningRadius = geofenceConfig.radiusInMeters * 1.2; // 20% buffer zone

  let status: 'inside' | 'warning' | 'outside' = 'outside';
  if (isInside) {
    status = 'inside';
  } else if (distance <= warningRadius) {
    status = 'warning';
  }

  return {
    isInside,
    distance: Math.round(distance),
    status,
  };
}
