package com.practice.reactive.dashboard.adapter.out;

import com.practice.reactive.dashboard.application.port.out.LoadSystemMetricPort;
import com.practice.reactive.dashboard.domain.model.CpuMetric;
import com.practice.reactive.dashboard.domain.model.MemoryMetric;
import com.practice.reactive.dashboard.domain.model.ThreadMetric;
import com.sun.management.OperatingSystemMXBean;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.lang.management.ThreadMXBean;

@Component
public class JvmSystemMetricAdapter implements LoadSystemMetricPort {

    private final OperatingSystemMXBean osBean;
    private final MemoryMXBean memoryBean;
    private final ThreadMXBean threadBean;

    public JvmSystemMetricAdapter() {
        this.osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
        this.memoryBean = ManagementFactory.getMemoryMXBean();
        this.threadBean = ManagementFactory.getThreadMXBean();
    }

    @Override
    public Mono<CpuMetric> loadCpuMetric() {
        return Mono.fromCallable(() -> {
            double processCpu = Math.max(0.0, osBean.getProcessCpuLoad() * 100.0);
            double systemCpu = Math.max(0.0, osBean.getCpuLoad() * 100.0);
            return CpuMetric.of(
                    Math.round(processCpu * 100.0) / 100.0,
                    Math.round(systemCpu * 100.0) / 100.0
            );
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Mono<MemoryMetric> loadMemoryMetric() {
        return Mono.fromCallable(() -> {
            MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
            return MemoryMetric.of(heapUsage.getUsed(), heapUsage.getMax());
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Mono<ThreadMetric> loadThreadMetric() {
        return Mono.fromCallable(() -> ThreadMetric.of(
                threadBean.getThreadCount(),
                threadBean.getPeakThreadCount(),
                threadBean.getDaemonThreadCount()
        )).subscribeOn(Schedulers.boundedElastic());
    }
}
