package com.practice.reactive.board.port.in;

import com.practice.reactive.board.domain.Post;
import com.practice.reactive.board.domain.PostDetail;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface PostQueryUseCase {
    Mono<PostDetail> getPostDetail(Long id);
    Flux<Post> getPosts(int page, int size);
    Mono<Long> getTotalCount();
}
