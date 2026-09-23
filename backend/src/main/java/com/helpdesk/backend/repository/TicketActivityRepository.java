package com.helpdesk.backend.repository;

import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.TicketActivity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketActivityRepository
        extends JpaRepository<TicketActivity, Long> {

    List<TicketActivity>
        findByTicketOrderByCreatedAtAsc(Ticket ticket);
}
