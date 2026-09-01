package com.practice.reactive.board.port.out;

import com.practice.reactive.board.domain.Comment;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CommentRepositoryPort {
    Mono<Comment> save(Comment comment);
    Flux<Comment> findByPostId(Long postId);
    Mono<Void> deleteById(Long id);
    Mono<Void> deleteByPostId(Long postId);
}
