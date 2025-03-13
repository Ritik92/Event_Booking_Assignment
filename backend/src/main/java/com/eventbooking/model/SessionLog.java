package com.eventbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "session_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ip_address", nullable = false)
    private String ipAddress;
    
    @Column(nullable = false)
    private String action;
    
    @Column(name = "event_id")
    private Long eventId;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    private String location;
}