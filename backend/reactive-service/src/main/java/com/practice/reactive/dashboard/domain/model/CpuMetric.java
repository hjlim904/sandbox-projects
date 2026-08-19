package com.practice.reactive.dashboard.domain.model;

import java.time.Instant;

public record CpuMetric(
        double processCpuUsage, // 백엔드 cpu
        double systemCpuUsage, // 전체 cpu
        Instant timestamp
) {
    public static CpuMetric of(double processCpu, double systemCpu) {
        return new CpuMetric(processCpu, systemCpu, Instant.now());
    }
}
