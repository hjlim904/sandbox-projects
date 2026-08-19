package com.practice.reactive.dashboard.application.service;

import com.practice.reactive.dashboard.application.port.out.CheckComponentHealthPort;
import com.practice.reactive.dashboard.application.port.out.LoadSystemMetricPort;
import com.practice.reactive.dashboard.domain.model.CpuMetric;
import com.practice.reactive.dashboard.domain.model.HealthMetric;
import com.practice.reactive.dashboard.domain.model.MemoryMetric;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DashboardMetricsServiceTest {

    @Mock
    private LoadSystemMetricPort loadSystemMetricPort;

    @Mock
    private CheckComponentHealthPort checkComponentHealthPort;

    private DashboardMetricsService service;

    @BeforeEach
    void setUp() {
        service = new DashboardMetricsService(loadSystemMetricPort, checkComponentHealthPort);
    }

    @Test
    @DisplayName("CPU 스트림이 지정된 간격 발행")
    void streamCpuMetrics_success() {
        CpuMetric dummyCpu = CpuMetric.of(15.5, 30.2);
        given(loadSystemMetricPort.loadCpuMetric()).willReturn(Mono.just(dummyCpu));

        StepVerifier.withVirtualTime(() -> service.streamCpuMetrics(Duration.ofSeconds(1)).take(2))
                .thenAwait(Duration.ofSeconds(2))
                .expectNext(dummyCpu)
                .expectNext(dummyCpu)
                .verifyComplete();

        verify(loadSystemMetricPort, atLeastOnce()).loadCpuMetric();
    }

    @Test
    @DisplayName("메모리 스트림이 지정된 간격 발행")
    void streamMemoryMetrics_success() {
        MemoryMetric dummyMem = MemoryMetric.of(512_000_000L, 1024_000_000L);
        given(loadSystemMetricPort.loadMemoryMetric()).willReturn(Mono.just(dummyMem));

        StepVerifier.withVirtualTime(() -> service.streamMemoryMetrics(Duration.ofSeconds(1)).take(1))
                .thenAwait(Duration.ofSeconds(1))
                .expectNext(dummyMem)
                .verifyComplete();
    }

    @Test
    @DisplayName("특정 컴포넌트 헬스 체크 조회 성공")
    void checkComponentHealth_success() {
        HealthMetric dummyHealth = HealthMetric.up("R2DBC-H2", 5L);
        given(checkComponentHealthPort.checkSpecificComponent("R2DBC-H2")).willReturn(Mono.just(dummyHealth));

        StepVerifier.create(service.checkComponentHealth("R2DBC-H2"))
                .expectNext(dummyHealth)
                .verifyComplete();
    }
}
