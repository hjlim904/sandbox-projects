package com.practice.reactive.dashboard.adapter.in;

import com.practice.reactive.dashboard.application.port.in.GetDashboardMetricsUseCase;
import com.practice.reactive.dashboard.domain.model.HealthMetric;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class HealthWebSocketHandlerTest {

    @Mock
    private GetDashboardMetricsUseCase getDashboardMetricsUseCase;

    @Mock
    private WebSocketSession session;

    private ObjectMapper objectMapper;
    private HealthWebSocketHandler handler;
    private final DefaultDataBufferFactory bufferFactory = new DefaultDataBufferFactory();

    @BeforeEach
    void setUp() {
        objectMapper = JsonMapper.builder().build();
        handler = new HealthWebSocketHandler(getDashboardMetricsUseCase, objectMapper);
    }

    @Test
    @DisplayName("WebSocket 세션 연결 헬스 메트릭 전송")
    void handle_streamHealthMetrics_toClient() {
        // given
        HealthMetric dummyHealth = HealthMetric.up("R2DBC-H2", 10L);
        given(getDashboardMetricsUseCase.streamHealthMetrics(any(Duration.class)))
                .willReturn(Flux.just(dummyHealth));
        given(session.receive()).willReturn(Flux.empty());

        given(session.textMessage(any(String.class))).willAnswer(invocation -> {
            String payload = invocation.getArgument(0);
            return new WebSocketMessage(
                    WebSocketMessage.Type.TEXT,
                    bufferFactory.wrap(payload.getBytes(StandardCharsets.UTF_8))
            );
        });

        ArgumentCaptor<Flux<WebSocketMessage>> captor = ArgumentCaptor.forClass(Flux.class);
        given(session.send(captor.capture())).willReturn(Mono.empty());

        // when
        Mono<Void> result = handler.handle(session);

        // then
        StepVerifier.create(result)
                .verifyComplete();

        verify(session).send(any());

        Flux<WebSocketMessage> sentMessages = captor.getValue();
        StepVerifier.create(sentMessages.take(1))
                .assertNext(message -> {
                    assertThat(message.getPayloadAsText()).contains("R2DBC-H2");
                    assertThat(message.getPayloadAsText()).contains("UP");
                })
                .verifyComplete();
    }
}
