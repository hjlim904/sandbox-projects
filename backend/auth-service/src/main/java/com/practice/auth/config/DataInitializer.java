package com.practice.auth.config;

import com.practice.auth.dto.SignUpRequest;
import com.practice.auth.repository.UserRepository;
import com.practice.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {
    private final AuthService authService;
    private final UserRepository userRepository;

    @Override
    public void run(ApplicationArguments args) {
        // admin 계정 생성 (비밀번호: 1)
        //if (!userRepository.existsByUsername("admin")) {
            authService.signup(new SignUpRequest("admin", "1", "관리자"));
        //}
        // user1 계정 생성 (비밀번호: 1)
        //if (!userRepository.existsByUsername("user1")) {
            authService.signup(new SignUpRequest("user1", "1", "일반유저"));
        //}
    }
}
