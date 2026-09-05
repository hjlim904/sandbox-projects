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
    private final SecretKey secretKey;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    public JwtTokenProvider(
            @Value("${jwt.secret:DijYByK6FnJST8EHfT9GE2Bk/jWpzZ3QjtY6rpZNxV4=}") String secret,
            @Value("${jwt.access-expiration:600000}") long accessTokenValidityInMilliseconds,
            @Value("${jwt.refresh-expiration:3600000}") long refreshTokenValidityInMilliseconds
    )  {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityInMilliseconds = accessTokenValidityInMilliseconds;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInMilliseconds;
    }

    // Access Token 생성(role 포함)
    public String createAccessToken(String userName, Role role) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInMilliseconds);

        return Jwts.builder().subject(userName).claim("role", role.name()).issuedAt(now).expiration(validity).signWith(secretKey).compact();
    }

    // refresh Token 생성(role 포함)
    public String createRefreshToken(String userName) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityInMilliseconds);

        return Jwts.builder().subject(userName).issuedAt(now).expiration(validity).signWith(secretKey).compact();
    }

    public long getRefreshTokenValidityInMilliseconds() {
        return refreshTokenValidityInMilliseconds;
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
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }
}
