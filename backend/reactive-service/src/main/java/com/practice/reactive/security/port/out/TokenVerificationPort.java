package com.practice.reactive.security.port.out;

import com.practice.reactive.security.domain.AuthenticatedUser;
import reactor.core.publisher.Mono;

public interface TokenVerificationPort {
    Mono<AuthenticatedUser> verifyAndExtract(String token);
}
