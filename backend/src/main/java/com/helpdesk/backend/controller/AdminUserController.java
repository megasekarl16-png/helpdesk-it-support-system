package com.helpdesk.backend.controller;

import com.helpdesk.backend.model.Role;
import com.helpdesk.backend.model.User;
import com.helpdesk.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

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
                .findByEmail(authentication.getName())
                .orElse(null);
    }

    private boolean isAdmin(User user) {
        return user != null &&
               user.getRole() == Role.ADMIN;
    }

    private boolean isDemoAccount(User user) {
    if (user == null || user.getEmail() == null) {
        return false;
    }

    String email = user.getEmail()
            .trim()
            .toLowerCase();

    return email.equals("employee.demo@helpdesk.com") ||
           email.equals("support.demo@helpdesk.com") ||
           email.equals("admin.demo@helpdesk.com");
}

    // =========================
    // GET ALL USERS
    // =========================

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            Authentication authentication
    ) {

        User currentUser =
                getCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found.");
        }

        if (!isAdmin(currentUser)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Admin access required.");
        }

        List<User> users =
                userRepository.findAll();

        return ResponseEntity.ok(users);
    }


    // =========================
    // UPDATE USER ROLE
    // =========================

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
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

        if (!isAdmin(currentUser)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Admin access required.");
        }

        User targetUser = userRepository
                .findById(id)
                .orElse(null);

        if (targetUser == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found.");
        }

        String requestedRole =
                request.get("role");

        if (
            requestedRole == null ||
            requestedRole.isBlank()
        ) {
            return ResponseEntity
                    .badRequest()
                    .body("Role is required.");
        }

        Role newRole;

        try {
            newRole = Role.valueOf(
                    requestedRole
                            .trim()
                            .toUpperCase()
            );
        } catch (IllegalArgumentException error) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Invalid role. Allowed roles: " +
                        "EMPLOYEE, IT_SUPPORT, ADMIN."
                    );
        }

        // Admin tidak boleh mengubah role dirinya sendiri.
        if (
            targetUser.getId()
                    .equals(currentUser.getId())
        ) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                        "You cannot change your own role."
                    );
        }

        // Demo accounts tidak boleh diubah role-nya.
if (isDemoAccount(targetUser)) {
    return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(
                "Demo account roles cannot be changed."
            );
}

        targetUser.setRole(newRole);

        User savedUser =
                userRepository.save(targetUser);

        return ResponseEntity.ok(savedUser);
    }
}
