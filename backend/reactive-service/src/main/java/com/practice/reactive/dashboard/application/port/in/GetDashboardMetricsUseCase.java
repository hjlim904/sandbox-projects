package com.practice.reactive.dashboard.application.port.in;

import com.practice.reactive.dashboard.domain.model.CpuMetric;
import com.practice.reactive.dashboard.domain.model.HealthMetric;
import com.practice.reactive.dashboard.domain.model.MemoryMetric;
import com.practice.reactive.dashboard.domain.model.ThreadMetric;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

public interface GetDashboardMetricsUseCase {
    // 지정된 간격 스트림
    Flux<CpuMetric> streamCpuMetrics(Duration interval);
    Flux<MemoryMetric> streamMemoryMetrics(Duration interval);
    Flux<ThreadMetric> streamThreadMetrics(Duration interval);
    
    // 스트림, 단건 체크
    Flux<HealthMetric> streamHealthMetrics(Duration interval);
    Mono<HealthMetric> checkComponentHealth(String componentName);
}
