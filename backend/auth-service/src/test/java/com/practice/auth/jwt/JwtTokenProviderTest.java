package com.practice.auth.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    // 테스트용 256비트 이상의 Secret Key (최소 32자 이상)
    private final String secretKey = "DijYByK6FnJST8EHfT9GE2Bk/jWpzZ3QjtY6rpZNxV4=";
    private final long validityInMilliseconds = 3600000; // 1시간

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secretKey, validityInMilliseconds);
    }

    @Test
    @DisplayName("username을 받아 jwt 토큰 생성")
    void crateTokenSuccess(){
        String username = "test user";
        String token = jwtTokenProvider.createToken(username);

        assertThat(token).isNotNull();
        assertThat(token.split("\\.")).hasSize(3); // JWT는 header.payload.signature로 되어있음
    }

    @Test
    @DisplayName("jwt 토큰에서 사용자 이름을 정상적으로 추출")
    void getUsernameFromToken(){
        String username = "test user";
        String token = jwtTokenProvider.createToken(username);

        String extractedUserName = jwtTokenProvider.getUserName(token);

        assertThat(extractedUserName).isEqualTo(username);
    }

    @Test
    @DisplayName("유효한 토큰이면 ture 반환")
    void validateTokenSuccess(){
        String token = jwtTokenProvider.createToken("testuser");

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertThat(isValid).isTrue();
    }
}
