package com.practice.reactive.security.domain;

import java.util.List;

public record AuthenticatedUser(
        String username,
        List<UserRole> roles
) {
    public boolean hasRole(UserRole role) {
        return roles != null && roles.contains(role);
    }
}
