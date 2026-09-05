package com.practice.auth.dto;

public record SignupResponse(
    Long id,
    String username,
    String name,
    String role
) {}
