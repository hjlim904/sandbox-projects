package com.practice.reactive.security.adapter.out;

import com.practice.reactive.security.domain.UserRole;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

class JwtTokenVerificationAdapterTest {

    private static final String SECRET = "DijYByK6FnJST8EHfT9GE2Bk/jWpzZ3QjtY6rpZNxV4=";
    private JwtTokenVerificationAdapter adapter;
    private SecretKey key;

    @BeforeEach
    void setUp() {
        adapter = new JwtTokenVerificationAdapter(SECRET);
        key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    @DisplayName("유효한 ROLE_ADMIN 토큰 검증 성공 시 AuthenticatedUser 반환")
    void verifyValidAdminToken() {
        String token = Jwts.builder()
                .subject("admin")
                .claim("role", "ROLE_ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        StepVerifier.create(adapter.verifyAndExtract(token))
                .expectNextMatches(user -> 
                        user.username().equals("admin") && 
                        user.hasRole(UserRole.ROLE_ADMIN)
                )
                .verifyComplete();
    }

    @Test
    @DisplayName("유효하지 않은 서명의 토큰은 에러 반환")
    void verifyInvalidSignatureToken() {
        String invalidToken = "invalid.token.signature";

        StepVerifier.create(adapter.verifyAndExtract(invalidToken))
                .expectError()
                .verify();
    }
}
