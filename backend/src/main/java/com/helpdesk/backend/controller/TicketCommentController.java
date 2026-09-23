package com.helpdesk.backend.controller;

import com.helpdesk.backend.model.Role;
import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.TicketComment;
import com.helpdesk.backend.model.User;
import com.helpdesk.backend.repository.TicketCommentRepository;
import com.helpdesk.backend.repository.TicketRepository;
import com.helpdesk.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class TicketCommentController {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketCommentController(
            TicketCommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository
    ) {
        this.commentRepository = commentRepository;
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

        if (
            currentUser.getRole() == Role.IT_SUPPORT ||
            currentUser.getRole() == Role.ADMIN
        ) {
            return true;
        }

        if (ticket.getCreatedBy() == null) {
            return false;
        }

        return ticket.getCreatedBy()
                .getId()
                .equals(currentUser.getId());
    }

    private boolean canSendComment(
            User currentUser,
            Ticket ticket
    ) {

        // Employee hanya boleh membalas ticket miliknya
// setelah IT Support memulai conversation.
if (currentUser.getRole() == Role.EMPLOYEE) {

    boolean isOwner =
            ticket.getCreatedBy() != null &&
            ticket.getCreatedBy()
                  .getId()
                  .equals(currentUser.getId());

    if (!isOwner) {
        return false;
    }

    return commentRepository
            .existsByTicketAndUserRole(
                    ticket,
                    Role.IT_SUPPORT
            );
}

        // IT Support hanya boleh membalas ticket
        // yang memang di-assign ke dirinya.
        if (currentUser.getRole() == Role.IT_SUPPORT) {

            return ticket.getAssignedTo() != null &&
                   ticket.getAssignedTo()
                         .getId()
                         .equals(currentUser.getId());
        }

        // Admin untuk sekarang hanya monitoring.
        return false;
    }

    @GetMapping
    public ResponseEntity<?> getComments(
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

        List<TicketComment> comments =
                commentRepository
                        .findByTicketOrderByCreatedAtAsc(ticket);

        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<?> createComment(
            @PathVariable Long ticketId,
            @RequestBody Map<String, String> request,
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

        if (!canSendComment(currentUser, ticket)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You cannot reply to this ticket.");
        }

        String message = request.get("message");

        if (
            message == null ||
            message.trim().isEmpty()
        ) {
            return ResponseEntity
                    .badRequest()
                    .body("Message cannot be empty.");
        }

        TicketComment comment =
                new TicketComment();

        comment.setMessage(message.trim());
        comment.setTicket(ticket);

        // User berasal dari JWT.
        // Frontend tidak menentukan pengirim.
        comment.setUser(currentUser);

        TicketComment savedComment =
                commentRepository.save(comment);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedComment);
    }
}
