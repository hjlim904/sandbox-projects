package com.practice.auth.controller;

import com.practice.auth.dto.LoginRequest;
import com.practice.auth.dto.LoginResponse;
import com.practice.auth.dto.SignUpRequest;
import com.practice.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@RequestBody SignUpRequest request){
        Long id = authService.signup(request);
        return ResponseEntity.ok(id);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> longin(@RequestBody LoginRequest request){
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
