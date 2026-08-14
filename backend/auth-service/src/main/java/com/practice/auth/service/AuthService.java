package com.practice.auth.service;

import com.practice.auth.domain.User;
import com.practice.auth.dto.LoginRequest;
import com.practice.auth.dto.LoginResponse;
import com.practice.auth.dto.SignUpRequest;
import com.practice.auth.jwt.JwtTokenProvider;
import com.practice.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Long signup(SignUpRequest request){
        if(userRepository.existsByUsername(request.username())){
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .build();

        return userRepository.save(user).getId();
    }

    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if(!passwordEncoder.matches(request.password(), user.getPassword())){
            throw  new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.createToken(user.getUsername());
        return new LoginResponse(token, user.getUsername(), user.getName());
    }


}
