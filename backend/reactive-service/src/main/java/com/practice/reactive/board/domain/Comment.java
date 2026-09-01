package com.practice.reactive.board.domain;

import java.time.LocalDateTime;

public record Comment(
        Long id,
        Long postId,
        String content,
        String author,
        LocalDateTime createdAt
) {
    public static Comment create(Long postId, String content, String author) {
        return new Comment(null, postId, content, author, LocalDateTime.now());
    }
}
