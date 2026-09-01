package com.practice.reactive.board.adapter.out.r2dbc.entity;

import com.practice.reactive.board.domain.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table("COMMENTS")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentEntity {
    @Id
    private Long id;
    private Long postId;
    private String content;
    private String author;
    private LocalDateTime createdAt;

    public Comment toDomain() {
        return new Comment(id, postId, content, author, createdAt);
    }

    public static CommentEntity fromDomain(Comment domain) {
        return CommentEntity.builder()
                .id(domain.id())
                .postId(domain.postId())
                .content(domain.content())
                .author(domain.author())
                .createdAt(domain.createdAt())
                .build();
    }
}
