package com.practice.reactive.dashboard.application.port.out;

import com.practice.reactive.dashboard.domain.model.HealthMetric;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CheckComponentHealthPort {
    Flux<HealthMetric> checkAllComponents();
    Mono<HealthMetric> checkSpecificComponent(String componentName);
}
