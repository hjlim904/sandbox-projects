package com.practice.reactive.dashboard.adapter.in;

import tools.jackson.databind.ObjectMapper;
import com.practice.reactive.dashboard.application.port.in.GetDashboardMetricsUseCase;
import com.practice.reactive.dashboard.domain.model.HealthMetric;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class HealthWebSocketHandler implements WebSocketHandler {

    private final GetDashboardMetricsUseCase getDashboardMetricsUseCase;
    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        log.info("WebSocket connected: sessionId={}", session.getId());

        // 1) 서버 -> 클라이언트: 1초마다 컴포넌트 헬스 상태 푸시 스트림
        Flux<WebSocketMessage> periodicHealthStream = getDashboardMetricsUseCase
                .streamHealthMetrics(Duration.ofSeconds(1))
                .map(this::toJsonText)
                .map(session::textMessage);

        // 2) 클라이언트 -> 서버: 클라이언트의 온디맨드 핑/진단 요청 처리
        Flux<WebSocketMessage> clientInteractiveStream = session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .flatMap(clientPayload -> {
                    log.info("Received client message: {}", clientPayload);
                    // 클라이언트가 "AUTH-SERVICE" 진단 요청 시 즉시 체크
                    if (clientPayload.contains("AUTH-SERVICE")) {
                        return getDashboardMetricsUseCase.checkComponentHealth("AUTH-SERVICE")
                                .map(this::toJsonText)
                                .map(session::textMessage);
                    }
                    // 일반 PING일 경우 PONG 응답
                    return Mono.just(session.textMessage("{\"event\":\"PONG\",\"message\":\"OK\"}"));
                });

        // 두 스트림을 병합(merge)하여 클라이언트로 전송
        Flux<WebSocketMessage> outboundStream = Flux.merge(periodicHealthStream, clientInteractiveStream)
                .doFinally(signal -> log.info("WebSocket disconnected: sessionId={}, signal={}", session.getId(), signal));

        return session.send(outboundStream);
    }

    private String toJsonText(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("JSON serialization error", e);
            return "{}";
        }
    }
}
