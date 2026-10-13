package com.smartqueue.smartqueue.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartqueue.smartqueue.dto.DashboardResponse;
import com.smartqueue.smartqueue.entity.Ticket;
import com.smartqueue.smartqueue.service.TicketService;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @RequestBody Ticket ticket) {

        return ResponseEntity
                .status(201)
                .body(ticketService.createTicket(ticket));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {

        return ResponseEntity.ok(
                ticketService.getAllTickets()
        );
    }

    @GetMapping("/waiting")
    public ResponseEntity<List<Ticket>> getWaitingQueue() {

        return ResponseEntity.ok(
                ticketService.getWaitingQueue()
        );
    }

    @GetMapping("/prediction")
    public ResponseEntity<List<Ticket>> getQueueWithWaitingTime() {

        return ResponseEntity.ok(
                ticketService.getQueueWithWaitingTime()
        );
    }

    @PostMapping("/serve-next")
    public ResponseEntity<Ticket> serveNextTicket() {

        return ResponseEntity.ok(
                ticketService.serveNextTicket()
        );
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Ticket> completeTicket(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ticketService.completeTicket(id)
        );
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                ticketService.getDashboardSummary()
        );
    }
}