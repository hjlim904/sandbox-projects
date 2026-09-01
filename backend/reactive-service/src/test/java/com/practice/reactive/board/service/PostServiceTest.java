package com.practice.reactive.board.service;

import com.practice.reactive.board.domain.Comment;
import com.practice.reactive.board.domain.Post;
import com.practice.reactive.board.port.out.CommentRepositoryPort;
import com.practice.reactive.board.port.out.PostRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepositoryPort postRepositoryPort;

    @Mock
    private CommentRepositoryPort commentRepositoryPort;

    private PostService postService;

    @BeforeEach
    void setUp() {
        postService = new PostService(postRepositoryPort, commentRepositoryPort);
    }

    @Test
    @DisplayName("게시글 상세 조회-댓글 목록과 결합된 PostDetail을 반환")
    void getPostDetailWithComments() {
        // Given
        Long postId = 1L;
        Post mockPost = new Post(postId, "테스트 제목", "테스트 내용", "user1", LocalDateTime.now(), LocalDateTime.now());
        Comment mockComment1 = new Comment(10L, postId, "첫 번째 댓글", "user2", LocalDateTime.now());
        Comment mockComment2 = new Comment(11L, postId, "두 번째 댓글", "admin", LocalDateTime.now());

        given(postRepositoryPort.findById(postId)).willReturn(Mono.just(mockPost));
        given(commentRepositoryPort.findByPostId(postId)).willReturn(Flux.just(mockComment1, mockComment2));

        // When & Then (StepVerifier)
        StepVerifier.create(postService.getPostDetail(postId))
                .expectNextMatches(detail -> 
                        detail.post().title().equals("테스트 제목") &&
                        detail.comments().size() == 2 &&
                        detail.comments().get(0).author().equals("user2")
                )
                .verifyComplete();
    }
}
