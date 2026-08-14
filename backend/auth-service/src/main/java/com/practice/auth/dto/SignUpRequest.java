package com.practice.auth.dto;

public record SignUpRequest (
    String username,
    String password,
    String name
){}
