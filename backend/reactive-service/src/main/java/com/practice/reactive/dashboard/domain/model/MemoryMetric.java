package com.practice.reactive.dashboard.domain.model;

import java.time.Instant;

public record MemoryMetric(
        long usedBytes,  // 사용 중인 힙
        long maxBytes,  // 최대 힙
        double usagePercentage, // 사용률
        Instant timestamp
) {
    public static MemoryMetric of(long used, long max){
        double percentage = max > 0 ? ((double) used / max) * 100.0 : 0.0;
        return new MemoryMetric(used, max, Math.round(percentage * 100.0) / 100.0, Instant.now());
    }
}
