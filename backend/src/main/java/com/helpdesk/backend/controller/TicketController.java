package com.helpdesk.backend.controller;

import com.helpdesk.backend.model.Role;
import com.helpdesk.backend.model.Ticket;
import com.helpdesk.backend.model.User;

import com.helpdesk.backend.model.TicketActivity;
import com.helpdesk.backend.repository.TicketActivityRepository;

import com.helpdesk.backend.repository.TicketRepository;
import com.helpdesk.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketActivityRepository activityRepository;

    public TicketController(
        TicketRepository ticketRepository,
        UserRepository userRepository,
        TicketActivityRepository activityRepository
) {
    this.ticketRepository = ticketRepository;
    this.userRepository = userRepository;
    this.activityRepository = activityRepository;
}


    // =========================
    // GET ALL TICKETS
    // =========================

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        List<Ticket> tickets;

        if (currentUser.getRole() == Role.EMPLOYEE) {

            tickets = ticketRepository
                    .findByCreatedBy(currentUser);

        } else {

            tickets = ticketRepository.findAll();
        }

        return ResponseEntity.ok(tickets);
    }


    // =========================
    // GET TICKET DETAIL
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        Ticket ticket = ticketRepository
                .findById(id)
                .orElse(null);

        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        if (!canAccessTicket(currentUser, ticket)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(ticket);
    }


    // =========================
    // CREATE TICKET
    // =========================

    @PostMapping
    public ResponseEntity<?> createTicket(
            @RequestBody Ticket ticket,
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found.");
        }

if (currentUser.getRole() != Role.EMPLOYEE) {
    return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body("Only employees can create tickets.");
}

if (!isValidTicketContent(ticket)) {
    return ResponseEntity
            .badRequest()
            .body(null);
}

        ticket.setId(null);
        ticket.setStatus("Open");

        // Owner selalu ditentukan backend.
        ticket.setCreatedBy(currentUser);
        ticket.setAssignedTo(null);

        ticket.setTitle(ticket.getTitle().trim());
ticket.setDescription(ticket.getDescription().trim());

        Ticket savedTicket =
                ticketRepository.save(ticket);

        // Catat activity ketika Employee mengedit isi ticket.
if (currentUser.getRole() == Role.EMPLOYEE) {

    recordActivity(
            savedTicket,
            currentUser,
            "EDITED",
            "Updated ticket information"
    );
}

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedTicket);
    }

@PostMapping("/{id}/assign")
public ResponseEntity<?> assignTicketToMe(
        @PathVariable Long id,
        Authentication authentication
) {

    User currentUser = getCurrentUser(authentication);

    if (currentUser == null) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Authenticated user not found.");
    }

    // Hanya IT Support yang boleh mengambil ticket.
    if (currentUser.getRole() != Role.IT_SUPPORT) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Only IT Support can assign tickets.");
    }

    Ticket ticket = ticketRepository
            .findById(id)
            .orElse(null);

    if (ticket == null) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Ticket not found.");
    }

    // Ticket yang sudah dimiliki support lain
    // tidak boleh direbut.
    if (
        ticket.getAssignedTo() != null &&
        !ticket.getAssignedTo()
                .getId()
                .equals(currentUser.getId())
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("Ticket is already assigned to another IT Support.");
    }

    String oldStatus = ticket.getStatus();

ticket.setAssignedTo(currentUser);

if ("Open".equals(ticket.getStatus())) {
    ticket.setStatus("In Progress");
}

Ticket savedTicket =
        ticketRepository.save(ticket);

recordActivity(
        savedTicket,
        currentUser,
        "ASSIGNED",
        "Assigned this ticket to themselves"
);

if (!oldStatus.equals(savedTicket.getStatus())) {

    recordActivity(
            savedTicket,
            currentUser,
            "STATUS_CHANGED",
            "Changed status from "
                    + oldStatus
                    + " to "
                    + savedTicket.getStatus()
    );
}

return ResponseEntity.ok(savedTicket);
}

    // =========================
    // UPDATE TICKET
    // =========================

    @PutMapping("/{id}")
public ResponseEntity<Ticket> updateTicket(
        @PathVariable Long id,
        @RequestBody Ticket updatedTicket,
        Authentication authentication
) {

    User currentUser = getCurrentUser(authentication);

    if (currentUser == null) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .build();
    }

    Ticket ticket = ticketRepository
            .findById(id)
            .orElse(null);

    if (ticket == null) {
        return ResponseEntity.notFound().build();
    }

    String oldStatus = ticket.getStatus();

    if (!canAccessTicket(currentUser, ticket)) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .build();
    }

    // Employee hanya boleh edit isi ticket miliknya
// selama ticket masih Open.
if (currentUser.getRole() == Role.EMPLOYEE) {

    if (!"Open".equals(ticket.getStatus())) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .build();
    }

    if (!isValidTicketContent(updatedTicket)) {
        return ResponseEntity
                .badRequest()
                .build();
    }

    ticket.setTitle(
            updatedTicket.getTitle().trim()
    );

    ticket.setCategory(
            updatedTicket.getCategory()
    );

    ticket.setPriority(
            updatedTicket.getPriority()
    );

    ticket.setDescription(
            updatedTicket.getDescription().trim()
    );

    // Employee tidak boleh mengubah status.

    } else if (currentUser.getRole() == Role.IT_SUPPORT) {

    // IT Support hanya boleh update ticket
    // yang di-assign ke dirinya sendiri.
    if (
        ticket.getAssignedTo() == null ||
        !ticket.getAssignedTo()
                .getId()
                .equals(currentUser.getId())
    ) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .build();
    }

   if (!isValidStatus(updatedTicket.getStatus())) {
    return ResponseEntity
            .badRequest()
            .build();
}
   
    ticket.setStatus(updatedTicket.getStatus());

} else if (currentUser.getRole() == Role.ADMIN) {

    if (!isValidStatus(updatedTicket.getStatus())) {
        return ResponseEntity
                .badRequest()
                .build();
    }

    ticket.setStatus(updatedTicket.getStatus());
}

    Ticket savedTicket =
        ticketRepository.save(ticket);

    // Catat activity ketika Employee mengedit ticket.
if (currentUser.getRole() == Role.EMPLOYEE) {

    recordActivity(
            savedTicket,
            currentUser,
            "EDITED",
            "Updated ticket information"
    );
}

if (
    oldStatus != null &&
    savedTicket.getStatus() != null &&
    !oldStatus.equals(savedTicket.getStatus())
) {

    recordActivity(
            savedTicket,
            currentUser,
            "STATUS_CHANGED",
            "Changed status from "
                    + oldStatus
                    + " to "
                    + savedTicket.getStatus()
    );
}

return ResponseEntity.ok(savedTicket);
}


    // =========================
    // DELETE TICKET
    // =========================

    @DeleteMapping("/{id}")
public ResponseEntity<Void> deleteTicket(
        @PathVariable Long id,
        Authentication authentication
) {

    User currentUser = getCurrentUser(authentication);

    if (currentUser == null) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .build();
    }

    // Hanya ADMIN yang boleh menghapus ticket.
    if (currentUser.getRole() != Role.ADMIN) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .build();
    }

    Ticket ticket = ticketRepository
            .findById(id)
            .orElse(null);

    if (ticket == null) {
        return ResponseEntity.notFound().build();
    }

    ticketRepository.delete(ticket);

    return ResponseEntity.noContent().build();
}


    // =========================
    // HELPER: CURRENT USER
    // =========================

    private User getCurrentUser(
            Authentication authentication
    ) {

        if (
            authentication == null ||
            authentication.getName() == null
        ) {
            return null;
        }

        return userRepository
                .findByEmail(
                        authentication.getName()
                )
                .orElse(null);
    }


    // =========================
    // HELPER: ACCESS CHECK
    // =========================

    private boolean canAccessTicket(
            User currentUser,
            Ticket ticket
    ) {

        // IT Support dan Admin boleh
        // mengakses semua ticket.
        if (
            currentUser.getRole() == Role.IT_SUPPORT ||
            currentUser.getRole() == Role.ADMIN
        ) {
            return true;
        }

        // Employee hanya boleh ticket sendiri.
        if (ticket.getCreatedBy() == null) {
            return false;
        }

        return ticket
                .getCreatedBy()
                .getId()
                .equals(currentUser.getId());
    }

private boolean isValidStatus(String status) {
    return status != null &&
            (
                status.equals("Open") ||
                status.equals("In Progress") ||
                status.equals("Resolved")
            );
}

private boolean isValidCategory(String category) {
    return category != null &&
            (
                category.equals("Hardware") ||
                category.equals("Software") ||
                category.equals("Network") ||
                category.equals("Account")
            );
}

private boolean isValidPriority(String priority) {
    return priority != null &&
            (
                priority.equals("Low") ||
                priority.equals("Medium") ||
                priority.equals("High")
            );
}

private boolean isValidTicketContent(Ticket ticket) {

    if (
        ticket.getTitle() == null ||
        ticket.getTitle().trim().isEmpty()
    ) {
        return false;
    }

    if (
        ticket.getDescription() == null ||
        ticket.getDescription().trim().isEmpty()
    ) {
        return false;
    }

    if (!isValidCategory(ticket.getCategory())) {
        return false;
    }

    if (!isValidPriority(ticket.getPriority())) {
        return false;
    }

    return true;
}

private void recordActivity(
        Ticket ticket,
        User user,
        String action,
        String description
) {
    TicketActivity activity = new TicketActivity();

    activity.setTicket(ticket);
    activity.setUser(user);
    activity.setAction(action);
    activity.setDescription(description);

    activityRepository.save(activity);
}
}
