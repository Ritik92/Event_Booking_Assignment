package com.eventbooking.service;

import com.eventbooking.model.Event;
import com.eventbooking.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private SessionLogService sessionLogService;
    
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }
    
    public List<Event> getEventsByUser(String ipAddress) {
        return eventRepository.findByCreatedBy(ipAddress);
    }
    
    public List<Event> getEventsByTimeRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByStartTimeBetween(start, end);
    }
    
    public Event createEvent(Event event, String ipAddress, String location) {
        event.setCreatedBy(ipAddress);
        event.setCreatedAt(LocalDateTime.now());
        
        Event savedEvent = eventRepository.save(event);
        sessionLogService.logAction(ipAddress, "CREATE_EVENT", savedEvent.getId(), location);
        
        return savedEvent;
    }
    
    public Optional<Event> updateEvent(Long id, Event eventDetails, String ipAddress, String location) {
        return eventRepository.findById(id)
            .map(existingEvent -> {
                // Check if IP matches the creator's IP (basic authentication)
                if (!existingEvent.getCreatedBy().equals(ipAddress)) {
                    return null; // Unauthorized
                }
                
                existingEvent.setTitle(eventDetails.getTitle());
                existingEvent.setDescription(eventDetails.getDescription());
                existingEvent.setStartTime(eventDetails.getStartTime());
                existingEvent.setEndTime(eventDetails.getEndTime());
                existingEvent.setLocation(eventDetails.getLocation());
                existingEvent.setTimezone(eventDetails.getTimezone());
                existingEvent.setUpdatedAt(LocalDateTime.now());
                
                Event updated = eventRepository.save(existingEvent);
                sessionLogService.logAction(ipAddress, "UPDATE_EVENT", updated.getId(), location);
                
                return updated;
            });
    }
    
    public boolean deleteEvent(Long id, String ipAddress, String location) {
        return eventRepository.findById(id)
            .map(event -> {
                // Check if IP matches the creator's IP (basic authentication)
                if (!event.getCreatedBy().equals(ipAddress)) {
                    return false;
                }
                
                eventRepository.delete(event);
                sessionLogService.logAction(ipAddress, "DELETE_EVENT", id, location);
                return true;
            })
            .orElse(false);
    }
}