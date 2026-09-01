package com.practice.reactive.board.domain;

import java.time.LocalDateTime;

public record Post(
        Long id,
        String title,
        String content,
        String author,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static Post create(String title, String content, String author) {
        LocalDateTime now = LocalDateTime.now();
        return new Post(null, title, content, author, now, now);
    }

    public Post update(String title, String content) {
        return new Post(this.id, title, content, this.author, this.createdAt, LocalDateTime.now());
    }
}
