package com.eventbooking.repository;

import com.eventbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCreatedBy(String ipAddress);
    List<Event> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Event> findByTimezone(String timezone);
}