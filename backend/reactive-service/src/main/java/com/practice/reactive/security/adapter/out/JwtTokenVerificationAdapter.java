package com.practice.reactive.security.adapter.out;

import com.practice.reactive.security.domain.AuthenticatedUser;
import com.practice.reactive.security.domain.UserRole;
import com.practice.reactive.security.port.out.TokenVerificationPort;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

@Component
public class JwtTokenVerificationAdapter implements TokenVerificationPort {

    private final SecretKey key;

    public JwtTokenVerificationAdapter(
            @Value("${jwt.secret:DijYByK6FnJST8EHfT9GE2Bk/jWpzZ3QjtY6rpZNxV4=}") String secretKey
    ) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<AuthenticatedUser> verifyAndExtract(String token) {
        return Mono.fromCallable(() -> {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String username = claims.getSubject();
            String roleStr = claims.get("role", String.class);
            List<UserRole> roles = (roleStr != null) 
                    ? List.of(UserRole.valueOf(roleStr)) 
                    : Collections.emptyList();

            return new AuthenticatedUser(username, roles);
        });
    }
}
