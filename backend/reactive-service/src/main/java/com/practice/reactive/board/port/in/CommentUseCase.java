package com.practice.reactive.board.port.in;

import com.practice.reactive.board.domain.Comment;
import reactor.core.publisher.Mono;

public interface CommentUseCase {
    Mono<Comment> addComment(Long postId, String content, String author);
    Mono<Void> deleteComment(Long commentId, String requester, boolean isAdmin);
}
