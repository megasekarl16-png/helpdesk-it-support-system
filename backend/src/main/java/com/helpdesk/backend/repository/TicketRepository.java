package com.helpdesk.backend.repository;

import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository
        extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatedBy(User createdBy);
}
