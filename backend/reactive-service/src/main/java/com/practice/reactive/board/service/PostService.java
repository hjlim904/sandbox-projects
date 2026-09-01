package com.practice.reactive.board.service;

import com.practice.reactive.board.domain.Post;
import com.practice.reactive.board.domain.PostDetail;
import com.practice.reactive.board.port.in.PostCommandUseCase;
import com.practice.reactive.board.port.in.PostQueryUseCase;
import com.practice.reactive.board.port.out.CommentRepositoryPort;
import com.practice.reactive.board.port.out.PostRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PostService implements PostCommandUseCase, PostQueryUseCase {

    private final PostRepositoryPort postRepositoryPort;
    private final CommentRepositoryPort commentRepositoryPort;

    @Override
    @Transactional
    public Mono<Post> createPost(String title, String content, String author) {
        Post newPost = Post.create(title, content, author);
        return postRepositoryPort.save(newPost);
    }

    @Override
    @Transactional
    public Mono<Post> updatePost(Long id, String title, String content, String requester) {
        return postRepositoryPort.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id)))
                .flatMap(post -> {
                    if (!post.author().equals(requester)) {
                        return Mono.error(new AccessDeniedException("본인이 작성한 글만 수정할 수 있습니다."));
                    }
                    Post updated = post.update(title, content);
                    return postRepositoryPort.save(updated);
                });
    }

    @Override
    @Transactional
    public Mono<Void> deletePost(Long id, String requester, boolean isAdmin) {
        return postRepositoryPort.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id)))
                .flatMap(post -> {
                    if (!isAdmin && !post.author().equals(requester)) {
                        return Mono.error(new AccessDeniedException("삭제 권한이 없습니다."));
                    }
                    return commentRepositoryPort.deleteByPostId(id)
                            .then(postRepositoryPort.deleteById(id));
                });
    }

    @Override
    public Mono<PostDetail> getPostDetail(Long id) {
        Mono<Post> postMono = postRepositoryPort.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id)));
        
        Mono<java.util.List<com.practice.reactive.board.domain.Comment>> commentsMono = 
                commentRepositoryPort.findByPostId(id).collectList();

        // Mono.zip으로 Post와 Comments를 병렬 합성!
        return Mono.zip(postMono, commentsMono, PostDetail::new);
    }

    @Override
    public Flux<Post> getPosts(int page, int size) {
        return postRepositoryPort.findAllPaged(page, size);
    }

    @Override
    public Mono<Long> getTotalCount() {
        return postRepositoryPort.count();
    }
}
