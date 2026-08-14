package com.practice.auth.dto;

public record LoginResponse(
   String token,
   String username,
   String name
) {}
