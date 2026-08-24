package com.practice.reactive.security.service;

import com.practice.reactive.security.domain.AuthenticatedUser;
import com.practice.reactive.security.domain.SecurityAccessResult;
import com.practice.reactive.security.domain.UserRole;
import com.practice.reactive.security.port.in.GetAccessInfoUseCase;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class SecurityAccessService implements GetAccessInfoUseCase {

    @Override
    public Mono<SecurityAccessResult> getPublicAccess() {
        return Mono.just(SecurityAccessResult.publicAccess());
    }

    @Override
    public Mono<SecurityAccessResult> getUserOnlyAccess(AuthenticatedUser user) {
        if (user == null || (!user.hasRole(UserRole.ROLE_USER) && !user.hasRole(UserRole.ROLE_ADMIN))) {
            return Mono.error(new AccessDeniedException("USER 권한이 필요합니다."));
        }
        return Mono.just(SecurityAccessResult.success("일반 사용자 영역 접근 성공!", user));
    }

    @Override
    public Mono<SecurityAccessResult> getAdminOnlyAccess(AuthenticatedUser user) {
        if (user == null || !user.hasRole(UserRole.ROLE_ADMIN)) {
            return Mono.error(new AccessDeniedException("ADMIN 권한이 필요합니다."));
        }
        return Mono.just(SecurityAccessResult.success("관리자 전용 일급 기밀 영역 접근 성공!", user));
    }

    @Override
    public Mono<SecurityAccessResult> getMyInfo(AuthenticatedUser user) {
        if (user == null) {
            return Mono.error(new AccessDeniedException("인증 정보가 없습니다."));
        }
        return Mono.just(SecurityAccessResult.success("내 정보 조회 성공", user));
    }
}
