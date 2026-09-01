package com.practice.reactive.board.port.out;

import com.practice.reactive.board.domain.Post;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PostRepositoryPort {
    Mono<Post> save(Post post);
    Mono<Post> findById(Long id);
    Flux<Post> findAllPaged(int page, int size);
    Mono<Long> count();
    Mono<Void> deleteById(Long id);
}
