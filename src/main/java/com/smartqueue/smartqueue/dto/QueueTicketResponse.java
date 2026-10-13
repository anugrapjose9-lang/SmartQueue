package com.smartqueue.smartqueue.dto;

import java.time.LocalDateTime;

public class QueueTicketResponse {

    private Long id;
    private String ticketNumber;
    private String customerName;
    private String serviceType;
    private String priority;
    private LocalDateTime arrivalTime;
    private int estimatedServiceTime;
    private String status;
    private int queuePosition;
    private int estimatedWaitingTime;

    public QueueTicketResponse(
            Long id,
            String ticketNumber,
            String customerName,
            String serviceType,
            String priority,
            LocalDateTime arrivalTime,
            int estimatedServiceTime,
            String status,
            int queuePosition,
            int estimatedWaitingTime) {

        this.id = id;
        this.ticketNumber = ticketNumber;
        this.customerName = customerName;
        this.serviceType = serviceType;
        this.priority = priority;
        this.arrivalTime = arrivalTime;
        this.estimatedServiceTime = estimatedServiceTime;
        this.status = status;
        this.queuePosition = queuePosition;
        this.estimatedWaitingTime = estimatedWaitingTime;
    }

    public Long getId() {
        return id;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getServiceType() {
        return serviceType;
    }

    public String getPriority() {
        return priority;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public int getEstimatedServiceTime() {
        return estimatedServiceTime;
    }

    public String getStatus() {
        return status;
    }

    public int getQueuePosition() {
        return queuePosition;
    }

    public int getEstimatedWaitingTime() {
        return estimatedWaitingTime;
    }
}