package com.practice.auth.jwt;

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
            @Value("${jwt.secret:v9y$B&E)H@MbQeThWmZq4t7w!z%C*F-JaNdRfUjXn2r5u8x/A?DGVkYp2s5v8y/B}") String secretKey,
            @Value("${jwt.expiration:3600000}") long validityInMilliseconds
    )  {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.validityInMilliseconds = validityInMilliseconds;
    }

    public String createToken(String userName){
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder().subject(userName).issuedAt(now).expiration(validity).signWith(key).compact();
    }

    public String getUserName(String token) {
        return parseClaims(token).getSubject();
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
