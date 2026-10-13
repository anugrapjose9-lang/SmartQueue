package com.smartqueue.smartqueue.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartqueue.smartqueue.dto.DashboardResponse;
import com.smartqueue.smartqueue.entity.Ticket;
import com.smartqueue.smartqueue.service.TicketService;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasRole('STAFF')")
public class StaffController {

    private final TicketService ticketService;

    public StaffController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                ticketService.getDashboardSummary()
        );
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getAllTickets() {

        return ResponseEntity.ok(
                ticketService.getAllTickets()
        );
    }

    @PostMapping("/serve-next")
    public ResponseEntity<Ticket> serveNextTicket() {

        return ResponseEntity.ok(
                ticketService.serveNextTicket()
        );
    }

    @PutMapping("/tickets/{id}/complete")
    public ResponseEntity<Ticket> completeTicket(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ticketService.completeTicket(id)
        );
    }
}