package com.practice.reactive.board.adapter.out.r2dbc;

import com.practice.reactive.board.adapter.out.r2dbc.entity.PostEntity;
import com.practice.reactive.board.adapter.out.r2dbc.repository.SpringDataPostRepository;
import com.practice.reactive.board.domain.Post;
import com.practice.reactive.board.port.out.PostRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class PostR2dbcAdapter implements PostRepositoryPort {

    private final SpringDataPostRepository repository;

    @Override
    public Mono<Post> save(Post post) {
        return repository.save(PostEntity.fromDomain(post))
                .map(PostEntity::toDomain);
    }

    @Override
    public Mono<Post> findById(Long id) {
        return repository.findById(id)
                .map(PostEntity::toDomain);
    }

    @Override
    public Flux<Post> findAllPaged(int page, int size) {
        long offset = (long) page * size;
        return repository.findAllPaged(size, offset)
                .map(PostEntity::toDomain);
    }

    @Override
    public Mono<Long> count() {
        return repository.count();
    }

    @Override
    public Mono<Void> deleteById(Long id) {
        return repository.deleteById(id);
    }
}
