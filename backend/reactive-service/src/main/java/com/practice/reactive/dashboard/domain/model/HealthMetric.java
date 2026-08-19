package com.practice.reactive.dashboard.domain.model;

import java.time.Instant;

public record HealthMetric(
        String componentName,
        String status,         // "UP", "DOWN"
        long responseTimeMs,   // 응답 시간 (ms)
        String details,
        Instant timestamp
) {
    public static HealthMetric up(String name, long responseTimeMs) {
        return new HealthMetric(name, "UP", responseTimeMs, "Normal", Instant.now());
    }

    public static HealthMetric down(String name, String error) {
        return new HealthMetric(name, "DOWN", -1, error, Instant.now());
    }
}