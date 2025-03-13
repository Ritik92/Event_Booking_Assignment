package com.eventbooking.service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.time.ZoneId;
import java.util.TimeZone;

@Service
public class LocationService {
    
    private DatabaseReader reader;
    
    @PostConstruct
    public void init() {
        try {
            //download the GeoLite2 City database from MaxMind
            // and place it in your resources folder
            InputStream database = getClass().getClassLoader().getResourceAsStream("GeoLite2-City.mmdb");
            if (database != null) {
                reader = new DatabaseReader.Builder(database).build();
            }
        } catch (IOException e) {
            // Log error and continue without geolocation functionality
            System.err.println("Could not initialize GeoIP database: " + e.getMessage());
        }
    }
    
    public String getLocationFromIp(String ipAddress) {
        if (reader == null) {
            return "Unknown";
        }
        
        try {
            InetAddress ip = InetAddress.getByName(ipAddress);
            if (ip.isLoopbackAddress()) {
                return "Local";
            }
            
            CityResponse response = reader.city(ip);
            String city = response.getCity().getName();
            String country = response.getCountry().getName();
            
            return (city != null ? city + ", " : "") + 
                   (country != null ? country : "Unknown");
                   
        } catch (IOException | GeoIp2Exception e) {
            return "Unknown";
        }
    }
    
    public String getTimezoneFromIp(String ipAddress) {
        if (reader == null) {
            return ZoneId.systemDefault().getId();
        }
        
        try {
            InetAddress ip = InetAddress.getByName(ipAddress);
            if (ip.isLoopbackAddress()) {
                return ZoneId.systemDefault().getId();
            }
            
            CityResponse response = reader.city(ip);
            return response.getLocation().getTimeZone();
            
        } catch (IOException | GeoIp2Exception e) {
            return ZoneId.systemDefault().getId();
        }
    }
}