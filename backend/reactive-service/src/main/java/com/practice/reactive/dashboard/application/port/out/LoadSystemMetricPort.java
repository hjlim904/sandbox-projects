package com.practice.reactive.dashboard.application.port.out;

import com.practice.reactive.dashboard.domain.model.CpuMetric;
import com.practice.reactive.dashboard.domain.model.MemoryMetric;
import com.practice.reactive.dashboard.domain.model.ThreadMetric;
import reactor.core.publisher.Mono;

public interface LoadSystemMetricPort {
    Mono<CpuMetric> loadCpuMetric();
    Mono<MemoryMetric> loadMemoryMetric();
    Mono<ThreadMetric> loadThreadMetric();
}
