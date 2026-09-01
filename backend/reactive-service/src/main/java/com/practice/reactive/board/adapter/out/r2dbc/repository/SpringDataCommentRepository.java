package com.practice.reactive.board.adapter.out.r2dbc.repository;

import com.practice.reactive.board.adapter.out.r2dbc.entity.CommentEntity;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface SpringDataCommentRepository extends R2dbcRepository<CommentEntity, Long> {
    Flux<CommentEntity> findByPostIdOrderByIdAsc(Long postId);
    Mono<Void> deleteByPostId(Long postId);
}
