package com.practice.auth.dto;

public record LoginResponse(
   String accessToken,
   String refreshToken,
   String username,
   String name,
   String role
) {}
