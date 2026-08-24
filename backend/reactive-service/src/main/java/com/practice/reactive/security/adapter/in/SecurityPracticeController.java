package com.practice.reactive.security.adapter.in;

import com.practice.reactive.security.domain.AuthenticatedUser;
import com.practice.reactive.security.domain.SecurityAccessResult;
import com.practice.reactive.security.domain.UserRole;
import com.practice.reactive.security.port.in.GetAccessInfoUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
public class SecurityPracticeController {

    private final GetAccessInfoUseCase getAccessInfoUseCase;

    @GetMapping("/public")
    public Mono<SecurityAccessResult> publicEndpoint() {
        return getAccessInfoUseCase.getPublicAccess();
    }

    @GetMapping("/user-only")
    public Mono<SecurityAccessResult> userOnlyEndpoint(Authentication authentication) {
        AuthenticatedUser user = toAuthenticatedUser(authentication);
        return getAccessInfoUseCase.getUserOnlyAccess(user);
    }

    @GetMapping("/admin-only")
    public Mono<SecurityAccessResult> adminOnlyEndpoint(Authentication authentication) {
        AuthenticatedUser user = toAuthenticatedUser(authentication);
        return getAccessInfoUseCase.getAdminOnlyAccess(user);
    }

    @GetMapping("/me")
    public Mono<SecurityAccessResult> getMyInfo(Authentication authentication) {
        AuthenticatedUser user = toAuthenticatedUser(authentication);
        return getAccessInfoUseCase.getMyInfo(user);
    }

    private AuthenticatedUser toAuthenticatedUser(Authentication authentication) {
        if (authentication == null) return null;
        List<UserRole> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(UserRole::valueOf)
                .toList();
        return new AuthenticatedUser(authentication.getName(), roles);
    }
}
