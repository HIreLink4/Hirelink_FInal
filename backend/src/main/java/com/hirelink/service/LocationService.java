package com.hirelink.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Service for location-based calculations and utilities.
 * Uses Haversine formula for calculating distances between coordinates.
 */
@Service
public class LocationService {
    
    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double KM_PER_DEGREE_LAT = 111.0; // Approximate km per degree of latitude
    
    /**
     * Calculate the distance between two coordinates using the Haversine formula.
     * 
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @return Distance in kilometers
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }
    
    /**
     * Calculate distance using BigDecimal coordinates.
     */
    public double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE;
        }
        return calculateDistance(
            lat1.doubleValue(), 
            lon1.doubleValue(), 
            lat2.doubleValue(), 
            lon2.doubleValue()
        );
    }
    
    /**
     * Get a bounding box for a given radius around a point.
     * This is used to create a preliminary filter for database queries
     * before applying the exact Haversine calculation.
     * 
     * @param lat Center latitude
     * @param lon Center longitude
     * @param radiusKm Radius in kilometers
     * @return BoundingBox with min/max lat/lon values
     */
    public BoundingBox getBoundingBox(double lat, double lon, double radiusKm) {
        // Calculate latitude delta (approximately 111km per degree)
        double latDelta = radiusKm / KM_PER_DEGREE_LAT;
        
        // Calculate longitude delta (varies by latitude)
        double lonDelta = radiusKm / (KM_PER_DEGREE_LAT * Math.cos(Math.toRadians(lat)));
        
        return new BoundingBox(
            lat - latDelta,  // minLat
            lat + latDelta,  // maxLat
            lon - lonDelta,  // minLon
            lon + lonDelta   // maxLon
        );
    }
    
    /**
     * Get bounding box using BigDecimal coordinates.
     */
    public BoundingBox getBoundingBox(BigDecimal lat, BigDecimal lon, double radiusKm) {
        if (lat == null || lon == null) {
            return null;
        }
        return getBoundingBox(lat.doubleValue(), lon.doubleValue(), radiusKm);
    }
    
    /**
     * Check if a point is within a given radius of another point.
     * 
     * @param centerLat Center point latitude
     * @param centerLon Center point longitude
     * @param pointLat Point to check latitude
     * @param pointLon Point to check longitude
     * @param radiusKm Radius in kilometers
     * @return true if point is within radius
     */
    public boolean isWithinRadius(double centerLat, double centerLon, 
                                   double pointLat, double pointLon, double radiusKm) {
        double distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
        return distance <= radiusKm;
    }
    
    /**
     * Check if coordinates are within radius using BigDecimal.
     */
    public boolean isWithinRadius(BigDecimal centerLat, BigDecimal centerLon,
                                   BigDecimal pointLat, BigDecimal pointLon, double radiusKm) {
        if (centerLat == null || centerLon == null || pointLat == null || pointLon == null) {
            return false;
        }
        return isWithinRadius(
            centerLat.doubleValue(), centerLon.doubleValue(),
            pointLat.doubleValue(), pointLon.doubleValue(),
            radiusKm
        );
    }
    
    /**
     * Record class representing a geographic bounding box.
     */
    public record BoundingBox(
        double minLat,
        double maxLat,
        double minLon,
        double maxLon
    ) {
        /**
         * Get minimum latitude as BigDecimal.
         */
        public BigDecimal minLatBD() {
            return BigDecimal.valueOf(minLat);
        }
        
        /**
         * Get maximum latitude as BigDecimal.
         */
        public BigDecimal maxLatBD() {
            return BigDecimal.valueOf(maxLat);
        }
        
        /**
         * Get minimum longitude as BigDecimal.
         */
        public BigDecimal minLonBD() {
            return BigDecimal.valueOf(minLon);
        }
        
        /**
         * Get maximum longitude as BigDecimal.
         */
        public BigDecimal maxLonBD() {
            return BigDecimal.valueOf(maxLon);
        }
    }
}
