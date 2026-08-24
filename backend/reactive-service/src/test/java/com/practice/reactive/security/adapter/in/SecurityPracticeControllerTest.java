package com.practice.reactive.security.adapter.in;

import com.practice.reactive.config.SecurityConfig;
import com.practice.reactive.security.adapter.out.JwtTokenVerificationAdapter;
import com.practice.reactive.security.domain.SecurityAccessResult;
import com.practice.reactive.security.port.in.GetAccessInfoUseCase;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@WebFluxTest(controllers = SecurityPracticeController.class)
@Import({SecurityConfig.class, JwtTokenVerificationAdapter.class, JwtAuthenticationConverter.class, JwtReactiveAuthenticationManager.class})
class SecurityPracticeControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private GetAccessInfoUseCase getAccessInfoUseCase;

    private static final String SECRET = "DijYByK6FnJST8EHfT9GE2Bk/jWpzZ3QjtY6rpZNxV4=";
    private SecretKey key;

    @BeforeEach
    void setUp() {
        key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        given(getAccessInfoUseCase.getPublicAccess())
                .willReturn(Mono.just(SecurityAccessResult.publicAccess()));
        given(getAccessInfoUseCase.getUserOnlyAccess(any()))
                .willReturn(Mono.just(SecurityAccessResult.publicAccess()));
        given(getAccessInfoUseCase.getAdminOnlyAccess(any()))
                .willReturn(Mono.just(SecurityAccessResult.publicAccess()));
    }

    private String createToken(String username, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("Public API는 토큰 없이 200 OK")
    void publicEndpoint() {
        webTestClient.get().uri("/api/security/public")
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    @DisplayName("비인증 사용자가 UserOnly 호출 시 401 Unauthorized")
    void unauthorizedUserOnly() {
        webTestClient.get().uri("/api/security/user-only")
                .exchange()
                .expectStatus().isUnauthorized();
    }

    @Test
    @DisplayName("일반 유저(ROLE_USER)가 AdminOnly 호출 시 403 Forbidden")
    void userForbiddenAdminOnly() {
        String token = createToken("user1", "ROLE_USER");

        webTestClient.get().uri("/api/security/admin-only")
                .header("Authorization", "Bearer " + token)
                .exchange()
                .expectStatus().isForbidden();
    }

    @Test
    @DisplayName("관리자(ROLE_ADMIN)가 AdminOnly 호출 시 200 OK")
    void adminCanAccessAdminOnly() {
        String token = createToken("admin", "ROLE_ADMIN");

        webTestClient.get().uri("/api/security/admin-only")
                .header("Authorization", "Bearer " + token)
                .exchange()
                .expectStatus().isOk();
    }
}
