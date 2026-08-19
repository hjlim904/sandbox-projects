package com.practice.reactive.dashboard.adapter.out;

import com.practice.reactive.dashboard.application.port.out.CheckComponentHealthPort;
import com.practice.reactive.dashboard.domain.model.HealthMetric;
import io.r2dbc.spi.ConnectionFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
public class ExternalHealthCheckAdapter implements CheckComponentHealthPort {

    private final ConnectionFactory connectionFactory;
    private final WebClient authWebClient;

    public ExternalHealthCheckAdapter(ConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
        this.authWebClient = WebClient.builder().baseUrl("http://localhost:8081").build();
    }

    @Override
    public Flux<HealthMetric> checkAllComponents() {
        return Flux.merge(checkR2dbcHealth(), checkAuthServiceHealth());
    }

    @Override
    public Mono<HealthMetric> checkSpecificComponent(String componentName) {
        if ("AUTH-SERVICE".equalsIgnoreCase(componentName)) {
            return checkAuthServiceHealth();
        }
        return checkR2dbcHealth();
    }

    private Mono<HealthMetric> checkR2dbcHealth() {
        long startTime = System.currentTimeMillis();
        return Mono.from(connectionFactory.create())
                .flatMap(conn -> Mono.from(conn.close()).thenReturn(true))
                .map(ok -> HealthMetric.up("R2DBC-H2", System.currentTimeMillis() - startTime))
                .timeout(Duration.ofMillis(1000))
                .onErrorResume(e -> Mono.just(HealthMetric.down("R2DBC-H2", e.getMessage())));
    }

    private Mono<HealthMetric> checkAuthServiceHealth() {
        long startTime = System.currentTimeMillis();
        return authWebClient.get()
                .uri("/h2-console")
                .exchangeToMono(res -> Mono.just(HealthMetric.up("AUTH-SERVICE", System.currentTimeMillis() - startTime)))
                .timeout(Duration.ofMillis(1000))
                .onErrorResume(e -> Mono.just(HealthMetric.down("AUTH-SERVICE", "Connection Refused / Unreachable")));
    }
}
