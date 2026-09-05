package com.practice.auth.service;

import com.practice.auth.domain.RefreshToken;
import com.practice.auth.domain.Role;
import com.practice.auth.domain.User;
import com.practice.auth.dto.*;
import com.practice.auth.jwt.JwtTokenProvider;
import com.practice.auth.repository.RefreshTokenRepository;
import com.practice.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
//@Transactional(readOnly = true)
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public SignupResponse signup(SignUpRequest request){
        if(userRepository.existsByUsername(request.username())){
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .role(Role.ROLE_USER)
                .build();
        User savedUser = userRepository.save(user);
        return new SignupResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getName(), savedUser.getRole().name());
    }

    @Transactional
    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if(!passwordEncoder.matches(request.password(), user.getPassword())){
            throw  new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getUsername(), user.getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUsername());
        Instant expiryDate = Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenValidityInMilliseconds());

        // Refresh Token DB 저장 또는 갱신 (RTR:Refresh Token Rotation)
        refreshTokenRepository.findByUsername(user.getUsername())
                .ifPresentOrElse(
                        rt -> rt.updateToken(refreshToken, expiryDate),
                        () -> refreshTokenRepository.save(new RefreshToken(user.getUsername(), refreshToken, expiryDate))
                );

        return new LoginResponse(accessToken, refreshToken, user.getUsername(), user.getName(), user.getRole().name());
    }

    @Transactional
    public TokenRefreshResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 Refresh Token입니다.");
        }
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Refresh Token입니다."));
        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new IllegalArgumentException("만료된 Refresh Token입니다. 다시 로그인해주세요.");
        }
        User user = userRepository.findByUsername(storedToken.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // RTR: 재발급 시 Refresh Token도 함께 갱신
        String newAccessToken = jwtTokenProvider.createAccessToken(user.getUsername(), user.getRole());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getUsername());
        Instant newExpiryDate = Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenValidityInMilliseconds());
        storedToken.updateToken(newRefreshToken, newExpiryDate);
        return new TokenRefreshResponse(newAccessToken, newRefreshToken);
    }
}
