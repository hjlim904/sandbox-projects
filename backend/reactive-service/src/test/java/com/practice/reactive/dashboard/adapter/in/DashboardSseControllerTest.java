package com.practice.reactive.dashboard.adapter.in;

import com.practice.reactive.dashboard.application.port.in.GetDashboardMetricsUseCase;
import com.practice.reactive.dashboard.domain.model.CpuMetric;
import com.practice.reactive.dashboard.domain.model.MemoryMetric;
import com.practice.reactive.dashboard.domain.model.ThreadMetric;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.Duration;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf;

@WebFluxTest(controllers = DashboardSseController.class)
class DashboardSseControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private GetDashboardMetricsUseCase getDashboardMetricsUseCase;

    @Test
    @WithMockUser
    @DisplayName("[Red/Green] /api/dashboard/stream/cpu 호출 시 CPU 메트릭 SSE 스트림을 수신한다")
    void streamCpu_success() {
        // given
        CpuMetric dummyCpu = CpuMetric.of(20.5, 45.0);
        given(getDashboardMetricsUseCase.streamCpuMetrics(any(Duration.class)))
                .willReturn(Flux.just(dummyCpu));

        // when & then
        Flux<CpuMetric> responseBody = webTestClient
                .mutateWith(csrf())
                .get()
                .uri("/api/dashboard/stream/cpu")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
                .returnResult(CpuMetric.class)
                .getResponseBody();

        StepVerifier.create(responseBody.take(1))
                .expectNext(dummyCpu)
                .verifyComplete();
    }

    @Test
    @WithMockUser
    @DisplayName("[Red/Green] /api/dashboard/stream/memory 호출 시 메모리 메트릭 SSE 스트림을 수신한다")
    void streamMemory_success() {
        // given
        MemoryMetric dummyMem = MemoryMetric.of(1024L, 2048L);
        given(getDashboardMetricsUseCase.streamMemoryMetrics(any(Duration.class)))
                .willReturn(Flux.just(dummyMem));

        // when & then
        Flux<MemoryMetric> responseBody = webTestClient
                .mutateWith(csrf())
                .get()
                .uri("/api/dashboard/stream/memory")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
                .returnResult(MemoryMetric.class)
                .getResponseBody();

        StepVerifier.create(responseBody.take(1))
                .expectNext(dummyMem)
                .verifyComplete();
    }

    @Test
    @WithMockUser
    @DisplayName("[Red/Green] /api/dashboard/stream/threads 호출 시 스레드 메트릭 SSE 스트림을 수신한다")
    void streamThreads_success() {
        // given
        ThreadMetric dummyThread = ThreadMetric.of(25, 40, 10L);
        given(getDashboardMetricsUseCase.streamThreadMetrics(any(Duration.class)))
                .willReturn(Flux.just(dummyThread));

        // when & then
        Flux<ThreadMetric> responseBody = webTestClient
                .mutateWith(csrf())
                .get()
                .uri("/api/dashboard/stream/threads")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM)
                .returnResult(ThreadMetric.class)
                .getResponseBody();

        StepVerifier.create(responseBody.take(1))
                .expectNext(dummyThread)
                .verifyComplete();
    }
}
