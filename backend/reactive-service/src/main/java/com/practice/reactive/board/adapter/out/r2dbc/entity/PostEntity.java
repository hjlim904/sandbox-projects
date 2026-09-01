package com.practice.reactive.board.adapter.out.r2dbc.entity;

import com.practice.reactive.board.domain.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("POSTS")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostEntity {
    @Id
    private Long id;
    private String title;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Post toDomain() {
        return new Post(id, title, content, author, createdAt, updatedAt);
    }

    public static PostEntity fromDomain(Post domain) {
        return PostEntity.builder()
                .id(domain.id())
                .title(domain.title())
                .content(domain.content())
                .author(domain.author())
                .createdAt(domain.createdAt())
                .updatedAt(domain.updatedAt())
                .build();
    }
}
