package com.practice.reactive.dashboard.domain.model;

import java.time.Instant;

public record ThreadMetric(
        int liveThreads, // 현재 스레드
        int peakThreads, // 최대 스레드
        long daemonThreads, // 데몬 스레드
        Instant timestamp
) {
    public static ThreadMetric of(int live, int peak, long daemon){
        return new ThreadMetric(live, peak, daemon, Instant.now());
    }
}
