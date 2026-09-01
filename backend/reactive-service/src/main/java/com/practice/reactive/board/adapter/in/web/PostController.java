package com.practice.reactive.board.adapter.in.web;

import com.practice.reactive.board.adapter.in.web.dto.CreatePostRequest;
import com.practice.reactive.board.adapter.in.web.dto.PageResponse;
import com.practice.reactive.board.adapter.in.web.dto.UpdatePostRequest;
import com.practice.reactive.board.domain.Post;
import com.practice.reactive.board.domain.PostDetail;
import com.practice.reactive.board.port.in.PostCommandUseCase;
import com.practice.reactive.board.port.in.PostQueryUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostCommandUseCase postCommandUseCase;
    private final PostQueryUseCase postQueryUseCase;

    // 1. 게시글 목록 페이징 조회
    @GetMapping
    public Mono<PageResponse<Post>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return postQueryUseCase.getPosts(page, size).collectList()
                .zipWith(postQueryUseCase.getTotalCount(), (items, total) -> PageResponse.of(items, page, size, total));
    }

    // 2. 게시글 상세 조회 (댓글 포함)
    @GetMapping("/{id}")
    public Mono<PostDetail> getPostDetail(@PathVariable Long id) {
        return postQueryUseCase.getPostDetail(id);
    }

    // 3. 게시글 작성 (인증 필요)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Post> createPost(
            @Valid @RequestBody CreatePostRequest request,
            Authentication authentication
    ) {
        String author = (authentication != null) ? authentication.getName() : "anonymous";
        return postCommandUseCase.createPost(request.title(), request.content(), author);
    }

    // 4. 게시글 수정 (작성자 본인만)
    @PutMapping("/{id}")
    public Mono<Post> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePostRequest request,
            Authentication authentication
    ) {
        String requester = (authentication != null) ? authentication.getName() : "";
        return postCommandUseCase.updatePost(id, request.title(), request.content(), requester);
    }

    // 5. 게시글 삭제 (작성자 본인 또는 관리자)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deletePost(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String requester = (authentication != null) ? authentication.getName() : "";
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals("ROLE_ADMIN"));
        return postCommandUseCase.deletePost(id, requester, isAdmin);
    }
}
