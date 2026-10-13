
package com.smartqueue.smartqueue.service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartqueue.smartqueue.dto.DashboardResponse;
import com.smartqueue.smartqueue.entity.Ticket;
import com.smartqueue.smartqueue.entity.TicketStatus;
import com.smartqueue.smartqueue.repository.TicketRepository;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    public Ticket createTicket(Ticket ticket) {

        ticket.setStatus(TicketStatus.WAITING);

        Ticket savedTicket = ticketRepository.save(ticket);

        savedTicket.setTicketNumber(
                String.format("Q-%03d", savedTicket.getId())
        );

        return ticketRepository.save(savedTicket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public List<Ticket> getWaitingQueue() {
        return getQueueWithWaitingTime();
    }

    public List<Ticket> getQueueWithWaitingTime() {

        List<Ticket> waitingTickets =
                ticketRepository.findByStatus(TicketStatus.WAITING);

        waitingTickets.sort(
                Comparator
                        .comparingInt(this::getPriorityRank)
                        .thenComparing(
                                Ticket::getArrivalTime,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
                        .thenComparing(Ticket::getId)
        );

        return waitingTickets;
    }

    private int getPriorityRank(Ticket ticket) {

        if (ticket.getPriority() == null) {
            return 3;
        }

        return switch (ticket.getPriority().toString().toUpperCase()) {
            case "HIGH" -> 1;
            case "NORMAL" -> 2;
            case "LOW" -> 3;
            default -> 4;
        };
    }

    public Ticket serveNextTicket() {

        List<Ticket> waitingTickets = getQueueWithWaitingTime();

        if (waitingTickets.isEmpty()) {
            throw new RuntimeException("No tickets available to serve");
        }

        Ticket nextTicket = waitingTickets.get(0);

        nextTicket.setStatus(TicketStatus.SERVING);

        return ticketRepository.save(nextTicket);
    }

    public Ticket completeTicket(Long id) {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.SERVING) {
            throw new RuntimeException(
                    "Only SERVING tickets can be completed"
            );
        }

        ticket.setStatus(TicketStatus.COMPLETED);

        return ticketRepository.save(ticket);
    }

    public DashboardResponse getDashboardSummary() {

        long total = ticketRepository.count();

        long waiting =
                ticketRepository.countByStatus(TicketStatus.WAITING);

        long serving =
                ticketRepository.countByStatus(TicketStatus.SERVING);

        long completed =
                ticketRepository.countByStatus(TicketStatus.COMPLETED);

        return new DashboardResponse(
                total,
                waiting,
                serving,
                completed
        );
    }
}
