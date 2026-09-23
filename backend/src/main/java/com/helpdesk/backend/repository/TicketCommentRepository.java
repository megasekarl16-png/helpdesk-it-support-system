package com.helpdesk.backend.repository;

import com.helpdesk.backend.model.Role;
import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCommentRepository
        extends JpaRepository<TicketComment, Long> {

    List<TicketComment>
        findByTicketOrderByCreatedAtAsc(Ticket ticket);

    boolean existsByTicketAndUserRole(
        Ticket ticket,
        Role role
);

}
