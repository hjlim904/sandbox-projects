package com.practice.auth.dto;

public record TokenRefreshResponse(
    String accessToken,
    String refreshToken
) {}
