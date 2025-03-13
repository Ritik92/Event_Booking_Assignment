package com.eventbooking.controller;

import com.eventbooking.model.Event;
import com.eventbooking.service.EventService;
import com.eventbooking.service.LocationService;
import com.eventbooking.util.IPUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {
    
    @Autowired
    private EventService eventService;
    
    @Autowired
    private LocationService locationService;
    
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user")
    public ResponseEntity<List<Event>> getUserEvents(HttpServletRequest request) {
        String ipAddress = IPUtils.getClientIpAddress(request);
        return ResponseEntity.ok(eventService.getEventsByUser(ipAddress));
    }
    
    @GetMapping("/range")
    public ResponseEntity<List<Event>> getEventsByTimeRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(eventService.getEventsByTimeRange(start, end));
    }
    
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event, HttpServletRequest request) {
        String ipAddress = IPUtils.getClientIpAddress(request);
        String location = locationService.getLocationFromIp(ipAddress);
        
        // If timezone not provided, detect from IP
        if (event.getTimezone() == null || event.getTimezone().isEmpty()) {
            event.setTimezone(locationService.getTimezoneFromIp(ipAddress));
        }
        
        Event createdEvent = eventService.createEvent(event, ipAddress, location);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody Event event,
            HttpServletRequest request) {
        
        String ipAddress = IPUtils.getClientIpAddress(request);
        String location = locationService.getLocationFromIp(ipAddress);
        
        return eventService.updateEvent(id, event, ipAddress, location)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, HttpServletRequest request) {
        String ipAddress = IPUtils.getClientIpAddress(request);
        String location = locationService.getLocationFromIp(ipAddress);
        
        boolean deleted = eventService.deleteEvent(id, ipAddress, location);
        
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "Not authorized or event not found"));
        }
    }
    
    @GetMapping("/timezone")
    public ResponseEntity<Map<String, String>> getUserTimezone(HttpServletRequest request) {
        String ipAddress = IPUtils.getClientIpAddress(request);
        String timezone = locationService.getTimezoneFromIp(ipAddress);
        return ResponseEntity.ok(Map.of("timezone", timezone));
    }
    
    @GetMapping("/location")
    public ResponseEntity<Map<String, String>> getUserLocation(HttpServletRequest request) {
        String ipAddress = IPUtils.getClientIpAddress(request);
        String location = locationService.getLocationFromIp(ipAddress);
        return ResponseEntity.ok(Map.of("location", location));
    }
}