package com.helpdesk.backend.controller;

import com.helpdesk.backend.model.Role;
import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.TicketActivity;
import com.helpdesk.backend.model.User;
import com.helpdesk.backend.repository.TicketActivityRepository;
import com.helpdesk.backend.repository.TicketRepository;
import com.helpdesk.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/activities")
public class TicketActivityController {

    private final TicketActivityRepository activityRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketActivityController(
            TicketActivityRepository activityRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository
    ) {
        this.activityRepository = activityRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Authentication authentication) {

        if (
            authentication == null ||
            authentication.getName() == null
        ) {
            return null;
        }

        return userRepository
                .findByEmail(authentication.getName())
                .orElse(null);
    }

    private boolean canViewTicket(
            User currentUser,
            Ticket ticket
    ) {

        // Support dan Admin boleh melihat semua ticket.
        if (
            currentUser.getRole() == Role.IT_SUPPORT ||
            currentUser.getRole() == Role.ADMIN
        ) {
            return true;
        }

        // Employee hanya boleh melihat ticket miliknya.
        return ticket.getCreatedBy() != null &&
               ticket.getCreatedBy()
                     .getId()
                     .equals(currentUser.getId());
    }

    @GetMapping
    public ResponseEntity<?> getActivities(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found.");
        }

        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElse(null);

        if (ticket == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Ticket not found.");
        }

        if (!canViewTicket(currentUser, ticket)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You cannot access this ticket.");
        }

        List<TicketActivity> activities =
                activityRepository
                        .findByTicketOrderByCreatedAtAsc(ticket);

        return ResponseEntity.ok(activities);
    }
}
