package com.eventbooking.repository;

import com.eventbooking.model.SessionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionLogRepository extends JpaRepository<SessionLog, Long> {
    List<SessionLog> findByIpAddress(String ipAddress);
    List<SessionLog> findByEventId(Long eventId);
}