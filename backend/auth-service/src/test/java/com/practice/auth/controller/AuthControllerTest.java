package com.practice.auth.controller;

import com.practice.auth.dto.LoginRequest;
import com.practice.auth.dto.LoginResponse;
import com.practice.auth.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    @DisplayName("로그인 성공 시 토큰 반환")
    void loginSuccess() throws Exception {
        LoginRequest request = new LoginRequest("admin", "1");
        LoginResponse response = new LoginResponse("mocked_jwt_token", "admin", "관리자");
        given(authService.login(any(LoginRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/auth/login").content(objectMapper.writeValueAsString(request)).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").value("mocked_jwt_token"))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.name").value("관리자"));
    }
}
