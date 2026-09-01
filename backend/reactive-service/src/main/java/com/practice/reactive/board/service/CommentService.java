package com.practice.reactive.board.service;

import com.practice.reactive.board.domain.Comment;
import com.practice.reactive.board.port.in.CommentUseCase;
import com.practice.reactive.board.port.out.CommentRepositoryPort;
import com.practice.reactive.board.port.out.PostRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CommentService implements CommentUseCase {

    private final CommentRepositoryPort commentRepositoryPort;
    private final PostRepositoryPort postRepositoryPort;

    @Override
    @Transactional
    public Mono<Comment> addComment(Long postId, String content, String author) {
        return postRepositoryPort.findById(postId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 게시글입니다: " + postId)))
                .flatMap(post -> {
                    Comment comment = Comment.create(postId, content, author);
                    return commentRepositoryPort.save(comment);
                });
    }

    @Override
    @Transactional
    public Mono<Void> deleteComment(Long commentId, String requester, boolean isAdmin) {
        // 간단한 댓글 삭제 (필요시 댓글 작성자 확인 로직 추가 가능)
        return commentRepositoryPort.deleteById(commentId);
    }
}
