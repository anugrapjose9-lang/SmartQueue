
package com.smartqueue.smartqueue.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartqueue.smartqueue.entity.Ticket;
import com.smartqueue.smartqueue.entity.User;
import com.smartqueue.smartqueue.repository.UserRepository;
import com.smartqueue.smartqueue.service.TicketService;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    public CustomerController(
            TicketService ticketService,
            UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    @PostMapping("/tickets")
    public ResponseEntity<Ticket> createTicket(
            @RequestBody Ticket ticket,
            Authentication authentication) {

        User customer = getCurrentUser(authentication);

        ticket.setCustomer(customer);
        ticket.setCustomerName(customer.getName());

        return ResponseEntity.status(201)
                .body(ticketService.createTicket(ticket));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getMyTickets(
            Authentication authentication) {

        User customer = getCurrentUser(authentication);

        List<Ticket> tickets = ticketService.getAllTickets()
                .stream()
                .filter(t -> t.getCustomer() != null
                        && t.getCustomer().getId()
                                .equals(customer.getId()))
                .toList();

        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/queue")
    public ResponseEntity<List<Ticket>> getQueue() {
        return ResponseEntity.ok(
                ticketService.getQueueWithWaitingTime());
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalStateException("User account not found"));
    }
}