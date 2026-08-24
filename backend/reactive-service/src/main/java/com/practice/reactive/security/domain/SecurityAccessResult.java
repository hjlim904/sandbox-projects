package com.practice.reactive.security.domain;

import java.util.List;

public record SecurityAccessResult(
        String status,
        String message,
        String username,
        List<String> roles
) {
    public static SecurityAccessResult publicAccess() {
        return new SecurityAccessResult("SUCCESS", "공개 API 호출 성공! 토큰 없이도 접근 가능합니다.", "ANONYMOUS", List.of("PUBLIC"));
    }

    public static SecurityAccessResult success(String message, AuthenticatedUser user) {
        return new SecurityAccessResult(
                "SUCCESS",
                message,
                user.username(),
                user.roles().stream().map(Enum::name).toList()
        );
    }
}
