package com.practice.auth.jwt;

import com.practice.auth.domain.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long validityInMilliseconds;
    public JwtTokenProvider(
            @Value("${jwt.secret:DijYByK6FnJST8EHfT9GE2Bk/jWpzZ3QjtY6rpZNxV4=}") String secretKey,
            @Value("${jwt.expiration:3600000}") long validityInMilliseconds
    )  {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.validityInMilliseconds = validityInMilliseconds;
    }

    public String createToken(String userName, Role role) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder().subject(userName).claim("role", role.name()).issuedAt(now).expiration(validity).signWith(key).compact();
    }

    public String getUserName(String token) {
        return parseClaims(token).getSubject();
    }

    public String getRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try{
            parseClaims(token);
            return true;
        }catch (JwtException|IllegalArgumentException e){
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
