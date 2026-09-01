package com.practice.reactive.board.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdatePostRequest(
        @NotBlank(message = "제목은 필수입니다.") String title,
        @NotBlank(message = "내용은 필수입니다.") String content
) {}
