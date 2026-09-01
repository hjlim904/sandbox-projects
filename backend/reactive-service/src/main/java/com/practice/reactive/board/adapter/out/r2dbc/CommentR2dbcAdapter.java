package com.practice.reactive.board.adapter.out.r2dbc;

import com.practice.reactive.board.adapter.out.r2dbc.entity.CommentEntity;
import com.practice.reactive.board.adapter.out.r2dbc.repository.SpringDataCommentRepository;
import com.practice.reactive.board.domain.Comment;
import com.practice.reactive.board.port.out.CommentRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class CommentR2dbcAdapter implements CommentRepositoryPort {

    private final SpringDataCommentRepository repository;

    @Override
    public Mono<Comment> save(Comment comment) {
        return repository.save(CommentEntity.fromDomain(comment))
                .map(CommentEntity::toDomain);
    }

    @Override
    public Flux<Comment> findByPostId(Long postId) {
        return repository.findByPostIdOrderByIdAsc(postId)
                .map(CommentEntity::toDomain);
    }

    @Override
    public Mono<Void> deleteById(Long id) {
        return repository.deleteById(id);
    }

    @Override
    public Mono<Void> deleteByPostId(Long postId) {
        return repository.deleteByPostId(postId);
    }
}
