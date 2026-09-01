package com.practice.reactive.board.adapter.in.web;

import com.practice.reactive.board.adapter.in.web.dto.CreateCommentRequest;
import com.practice.reactive.board.domain.Comment;
import com.practice.reactive.board.port.in.CommentUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentUseCase commentUseCase;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Comment> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication
    ) {
        String author = (authentication != null) ? authentication.getName() : "anonymous";
        return commentUseCase.addComment(postId, request.content(), author);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        String requester = (authentication != null) ? authentication.getName() : "";
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals("ROLE_ADMIN"));
        return commentUseCase.deleteComment(commentId, requester, isAdmin);
    }
}
