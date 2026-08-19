package com.practice.reactive.dashboard.adapter.in;

import com.practice.reactive.dashboard.application.port.in.GetDashboardMetricsUseCase;
import com.practice.reactive.dashboard.domain.model.CpuMetric;
import com.practice.reactive.dashboard.domain.model.MemoryMetric;
import com.practice.reactive.dashboard.domain.model.ThreadMetric;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.Duration;

@RestController
@RequestMapping("/api/dashboard/stream")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 프론트엔드 연동용
public class DashboardSseController {

    private final GetDashboardMetricsUseCase getDashboardMetricsUseCase;

    /**
     * 실시간 CPU 사용률 SSE 스트림 (기본 1초 주기)
     */
    @GetMapping(value = "/cpu", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<CpuMetric>> streamCpu(
            @RequestParam(defaultValue = "1") int intervalSec) {
        return getDashboardMetricsUseCase.streamCpuMetrics(Duration.ofSeconds(intervalSec))
                .map(data -> ServerSentEvent.<CpuMetric>builder()
                        .event("cpu-metric")
                        .data(data)
                        .build());
    }

    /**
     * 실시간 JVM 메모리 SSE 스트림 (기본 1초 주기)
     */
    @GetMapping(value = "/memory", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<MemoryMetric>> streamMemory(
            @RequestParam(defaultValue = "1") int intervalSec) {
        return getDashboardMetricsUseCase.streamMemoryMetrics(Duration.ofSeconds(intervalSec))
                .map(data -> ServerSentEvent.<MemoryMetric>builder()
                        .event("memory-metric")
                        .data(data)
                        .build());
    }

    /**
     * 실시간 스레드 수 SSE 스트림 (기본 1초 주기)
     */
    @GetMapping(value = "/threads", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<ThreadMetric>> streamThreads(
            @RequestParam(defaultValue = "1") int intervalSec) {
        return getDashboardMetricsUseCase.streamThreadMetrics(Duration.ofSeconds(intervalSec))
                .map(data -> ServerSentEvent.<ThreadMetric>builder()
                        .event("threads-metric")
                        .data(data)
                        .build());
    }
}
