package com.practice.auth.dto;

public record LoginRequest(
        String username,
        String password
) {}
