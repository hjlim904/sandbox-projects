package com.practice.reactive.board.port.in;

import com.practice.reactive.board.domain.Post;
import reactor.core.publisher.Mono;

public interface PostCommandUseCase {
    Mono<Post> createPost(String title, String content, String author);
    Mono<Post> updatePost(Long id, String title, String content, String requester);
    Mono<Void> deletePost(Long id, String requester, boolean isAdmin);
}
