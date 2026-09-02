package com.practice.reactive.agent.adapter.out.tools;

import com.practice.reactive.board.domain.Post;
import com.practice.reactive.board.port.in.PostQueryUseCase;
import com.practice.reactive.dashboard.application.port.out.CheckComponentHealthPort;
import com.practice.reactive.dashboard.application.port.out.LoadSystemMetricPort;
import com.practice.reactive.dashboard.domain.model.CpuMetric;
import com.practice.reactive.dashboard.domain.model.HealthMetric;
import com.practice.reactive.dashboard.domain.model.MemoryMetric;
import com.practice.reactive.dashboard.domain.model.ThreadMetric;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class SystemOpsToolsTest {

    @Mock
    private LoadSystemMetricPort loadSystemMetricPort;

    @Mock
    private CheckComponentHealthPort checkComponentHealthPort;

    @Mock
    private PostQueryUseCase postQueryUseCase;

    private SystemOpsTools tools;

    @BeforeEach
    void setUp() {
        tools = new SystemOpsTools(loadSystemMetricPort, checkComponentHealthPort, postQueryUseCase);
    }

    @Test
    @DisplayName("@Tool getSystemMetrics 호출 시 CPU, 메모리, 스레드 반환")
    void getSystemMetrics_success() {
        // given
        given(loadSystemMetricPort.loadCpuMetric()).willReturn(Mono.just(CpuMetric.of(12.5, 3.2)));
        given(loadSystemMetricPort.loadMemoryMetric()).willReturn(Mono.just(MemoryMetric.of(100L, 500L)));
        given(loadSystemMetricPort.loadThreadMetric()).willReturn(Mono.just(ThreadMetric.of(25, 50, 50)));

        // when
        Map<String, Record> result = tools.getSystemMetrics();

        // then
        assertThat(result).containsKeys("cpu", "memory", "threads");
        assertThat(((CpuMetric) result.get("cpu")).processCpuUsage()).isEqualTo(12.5);
    }

    @Test
    @DisplayName("@Tool searchBoardPosts 호출 시 키워드로 필터링된 게시글 목록 반환")
    void searchBoardPosts_success() {
        // given
        Post post1 = new Post(1L, "WebFlux 성능 튜닝", "내용1", "user1", LocalDateTime.now(), LocalDateTime.now());
        Post post2 = new Post(2L, "Spring Security 가이드", "내용2", "admin", LocalDateTime.now(), LocalDateTime.now());
        given(postQueryUseCase.getPosts(0, 5)).willReturn(Flux.just(post1, post2));

        // when
        Map<String, Object> result = tools.searchBoardPosts("WebFlux", 5);

        // then
        assertThat(result.get("totalFound")).isEqualTo(1);
    }
}
