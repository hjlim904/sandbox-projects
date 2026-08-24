package com.practice.reactive.security.port.in;

import com.practice.reactive.security.domain.AuthenticatedUser;
import com.practice.reactive.security.domain.SecurityAccessResult;
import reactor.core.publisher.Mono;

public interface GetAccessInfoUseCase {
    Mono<SecurityAccessResult> getPublicAccess();
    Mono<SecurityAccessResult> getUserOnlyAccess(AuthenticatedUser user);
    Mono<SecurityAccessResult> getAdminOnlyAccess(AuthenticatedUser user);
    Mono<SecurityAccessResult> getMyInfo(AuthenticatedUser user);
}
