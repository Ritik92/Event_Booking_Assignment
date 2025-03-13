package com.eventbooking.service;

import com.eventbooking.model.SessionLog;
import com.eventbooking.repository.SessionLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionLogService {
    
    @Autowired
    private SessionLogRepository sessionLogRepository;
    
    public List<SessionLog> getLogsByIp(String ipAddress) {
        return sessionLogRepository.findByIpAddress(ipAddress);
    }
    
    public List<SessionLog> getLogsByEventId(Long eventId) {
        return sessionLogRepository.findByEventId(eventId);
    }
    
    public void logAction(String ipAddress, String action, Long eventId, String location) {
        SessionLog log = new SessionLog();
        log.setIpAddress(ipAddress);
        log.setAction(action);
        log.setEventId(eventId);
        log.setTimestamp(LocalDateTime.now());
        log.setLocation(location);
        
        sessionLogRepository.save(log);
    }
}