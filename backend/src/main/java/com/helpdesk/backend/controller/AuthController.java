package com.helpdesk.backend.controller;

import com.helpdesk.backend.dto.LoginRequest;
import com.helpdesk.backend.dto.RegisterRequest;
import com.helpdesk.backend.model.Role;
import com.helpdesk.backend.model.User;
import com.helpdesk.backend.repository.UserRepository;
import com.helpdesk.backend.service.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        if (
            request.getName() == null ||
            request.getName().isBlank() ||
            request.getEmail() == null ||
            request.getEmail().isBlank() ||
            request.getPassword() == null ||
            request.getPassword().isBlank()
        ) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "All fields are required."
                    ));
        }

        String email = request
                .getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Email is already registered."
                    ));
        }

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(Role.EMPLOYEE);

        User savedUser = userRepository.save(user);

        Map<String, Object> response =
                new HashMap<>();

        response.put("id", savedUser.getId());
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        System.out.println(
                "=== LOGIN ENDPOINT MASUK ==="
        );

        if (
            request.getEmail() == null ||
            request.getEmail().isBlank() ||
            request.getPassword() == null ||
            request.getPassword().isBlank()
        ) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Email and password are required."
                    ));
        }

        String email = request
                .getEmail()
                .trim()
                .toLowerCase();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (
            user == null ||
            !passwordEncoder.matches(
                    request.getPassword(),
                    user.getPassword()
            )
        ) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid email or password."
                    ));
        }

        String token =
                jwtService.generateToken(user);

        Map<String, Object> response =
                new HashMap<>();

        response.put("token", token);
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}
