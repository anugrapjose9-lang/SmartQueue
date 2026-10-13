package com.smartqueue.smartqueue.dto;

public class DashboardResponse {
    private long totalTickets;
    private long waitingTickets;
    private long servingTickets;
    private long completedTickets;

    public DashboardResponse(long totalTickets, long waitingTickets, long servingTickets, long completedTickets) {
        this.totalTickets = totalTickets;
        this.waitingTickets = waitingTickets;
        this.servingTickets = servingTickets;
        this.completedTickets = completedTickets;
    }

    public long getTotalTickets() { return totalTickets; }
    public long getWaitingTickets() { return waitingTickets; }
    public long getServingTickets() { return servingTickets; }
    public long getCompletedTickets() { return completedTickets; }
}
