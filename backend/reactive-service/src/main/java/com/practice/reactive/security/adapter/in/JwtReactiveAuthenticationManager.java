package com.practice.reactive.security.adapter.in;

import com.practice.reactive.security.port.out.TokenVerificationPort;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtReactiveAuthenticationManager implements ReactiveAuthenticationManager {

    private final TokenVerificationPort tokenVerificationPort;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String token = authentication.getCredentials().toString();
        return tokenVerificationPort.verifyAndExtract(token)
                .map(user -> {
                    List<SimpleGrantedAuthority> authorities = user.roles().stream()
                            .map(role -> new SimpleGrantedAuthority(role.name()))
                            .toList();
                    return (Authentication) new UsernamePasswordAuthenticationToken(user.username(), null, authorities);
                })
                .onErrorResume(e -> Mono.error(new BadCredentialsException("유효하지 않은 JWT 토큰입니다: " + e.getMessage())));
    }
}
