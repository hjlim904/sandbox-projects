package com.practice.reactive.security.service;

import com.practice.reactive.security.domain.AuthenticatedUser;
import com.practice.reactive.security.domain.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import reactor.test.StepVerifier;

import java.util.List;

class SecurityAccessServiceTest {

    private SecurityAccessService service;

    @BeforeEach
    void setUp() {
        service = new SecurityAccessService();
    }

    @Test
    @DisplayName("일반 유저는 UserOnly 영역 접근 성공")
    void userCanAccessUserOnly() {
        AuthenticatedUser user = new AuthenticatedUser("user1", List.of(UserRole.ROLE_USER));

        StepVerifier.create(service.getUserOnlyAccess(user))
                .expectNextMatches(res -> res.status().equals("SUCCESS") && res.username().equals("user1"))
                .verifyComplete();
    }

    @Test
    @DisplayName("일반 유저(ROLE_USER)가 AdminOnly 영역 접근 시 AccessDeniedException 발생")
    void userCannotAccessAdminOnly() {
        AuthenticatedUser user = new AuthenticatedUser("user1", List.of(UserRole.ROLE_USER));

        StepVerifier.create(service.getAdminOnlyAccess(user))
                .expectError(AccessDeniedException.class)
                .verify();
    }

    @Test
    @DisplayName("관리자(ROLE_ADMIN)는 AdminOnly 영역 접근 성공")
    void adminCanAccessAdminOnly() {
        AuthenticatedUser admin = new AuthenticatedUser("admin", List.of(UserRole.ROLE_ADMIN));

        StepVerifier.create(service.getAdminOnlyAccess(admin))
                .expectNextMatches(res -> res.status().equals("SUCCESS") && res.username().equals("admin"))
                .verifyComplete();
    }
}
