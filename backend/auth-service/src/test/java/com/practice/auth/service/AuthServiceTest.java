package com.practice.auth.service;

import com.practice.auth.domain.User;
import com.practice.auth.dto.LoginRequest;
import com.practice.auth.dto.LoginResponse;
import com.practice.auth.dto.SignUpRequest;
import com.practice.auth.jwt.JwtTokenProvider;
import com.practice.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("admin")
                .password("encoded_password")
                .name("관리자")
                .build();
    }

    @Test
    @DisplayName("비밀번호를 암호화해서 저장")
    void signupSuccess(){
        SignUpRequest request = new SignUpRequest("admin", "1", "관리자");
        given(userRepository.existsByUsername("admin")).willReturn(false);
        given(passwordEncoder.encode("1")).willReturn("encoded_password");
        given(userRepository.save(any(User.class))).willReturn(testUser);

        Long savedId = authService.signup(request);

        assertThat(savedId).isEqualTo(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("로그인 성공 시 JWT 토큰과 사용자 정보를 반환")
    void loginSuccess(){
        LoginRequest request = new LoginRequest("admin", "1");
        given(userRepository.findByUsername("admin")).willReturn(Optional.of(testUser));
        given(passwordEncoder.matches("1", "encoded_password")).willReturn(true);
        given(jwtTokenProvider.createToken("admin")).willReturn("mocked_jwt_token");

        LoginResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("mocked_jwt_token");
        assertThat(response.username()).isEqualTo("admin");
        assertThat(response.name()).isEqualTo("관리자");
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호")
    void loginFailWrongPassword(){
        LoginRequest request = new LoginRequest("admin", "wrong_password");
        given(userRepository.findByUsername("admin")).willReturn(Optional.of(testUser));
        given(passwordEncoder.matches("wrong_password", "encoded_password")).willReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("비밀번호가 일치하지 않습니다.");
    }
}
