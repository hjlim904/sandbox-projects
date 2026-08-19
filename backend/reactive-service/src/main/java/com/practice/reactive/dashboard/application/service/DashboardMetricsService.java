package com.practice.reactive.dashboard.application.service;

import com.practice.reactive.dashboard.application.port.in.GetDashboardMetricsUseCase;
import com.practice.reactive.dashboard.application.port.out.CheckComponentHealthPort;
import com.practice.reactive.dashboard.application.port.out.LoadSystemMetricPort;
import com.practice.reactive.dashboard.domain.model.CpuMetric;
import com.practice.reactive.dashboard.domain.model.HealthMetric;
import com.practice.reactive.dashboard.domain.model.MemoryMetric;
import com.practice.reactive.dashboard.domain.model.ThreadMetric;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class DashboardMetricsService implements GetDashboardMetricsUseCase {

    private final LoadSystemMetricPort loadSystemMetricPort;
    private final CheckComponentHealthPort checkComponentHealthPort;

    @Override
    public Flux<CpuMetric> streamCpuMetrics(Duration interval) {
        return Flux.interval(interval)
                .flatMap(tick -> loadSystemMetricPort.loadCpuMetric());
    }

    @Override
    public Flux<MemoryMetric> streamMemoryMetrics(Duration interval) {
        return Flux.interval(interval)
                .flatMap(tick -> loadSystemMetricPort.loadMemoryMetric());
    }

    @Override
    public Flux<ThreadMetric> streamThreadMetrics(Duration interval) {
        return Flux.interval(interval)
                .flatMap(tick -> loadSystemMetricPort.loadThreadMetric());
    }

    @Override
    public Flux<HealthMetric> streamHealthMetrics(Duration interval) {
        return Flux.interval(interval)
                .flatMap(tick -> checkComponentHealthPort.checkAllComponents());
    }

    @Override
    public Mono<HealthMetric> checkComponentHealth(String componentName) {
        return checkComponentHealthPort.checkSpecificComponent(componentName);
    }
}
