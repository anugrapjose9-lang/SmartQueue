package com.smartqueue.smartqueue.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartqueue.smartqueue.entity.Ticket;
import com.smartqueue.smartqueue.entity.TicketStatus;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatus(TicketStatus status);
    long countByStatus(TicketStatus status);
}
