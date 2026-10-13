package com.smartqueue.smartqueue.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartqueue.smartqueue.dto.AuthRequest;
import com.smartqueue.smartqueue.dto.AuthResponse;
import com.smartqueue.smartqueue.entity.User;
import com.smartqueue.smartqueue.security.JwtService;
import com.smartqueue.smartqueue.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            JwtService jwtService) {

        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password) {

        try {

            User user = authService.registerCustomer(
                    name,
                    email,
                    password
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new AuthResponse(
                            null,
                            user.getRole().name(),
                            user.getName()
                    ));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AuthRequest request) {

        try {

            User user =
                    authService.authenticate(request);

            String token =
                    jwtService.generateToken(user);

            return ResponseEntity.ok(
                    new AuthResponse(
                            token,
                            user.getRole().name(),
                            user.getName()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }
}