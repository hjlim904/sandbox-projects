package com.practice.reactive.agent.application.service;

import com.practice.reactive.agent.application.port.out.GeminiLlmPort;
import com.practice.reactive.agent.application.port.out.GeminiLlmPort.ToolDecision;
import com.practice.reactive.agent.domain.model.AgentEvent;
import com.practice.reactive.agent.domain.model.ChatMessage;
import com.practice.reactive.agent.domain.model.ToolCallInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ChatAgentServiceTest {

    @Mock
    private GeminiLlmPort geminiLlmPort;

    @Mock
    private AgentToolRegistry toolRegistry;

    private ChatAgentService chatAgentService;

    @BeforeEach
    void setUp() {
        chatAgentService = new ChatAgentService(geminiLlmPort, toolRegistry);
    }

    @Test
    @DisplayName("일반 질문 시 Tool 호출 없이 바로 답변 스트림을 반환한다")
    void chatWithAgent_directAnswer() {
        // given
        List<ChatMessage> conversation = List.of(ChatMessage.user("안녕하세요!"));
        given(toolRegistry.getToolDeclarations()).willReturn(List.of());
        given(geminiLlmPort.decideToolOrDirectAnswer(any(), any()))
                .willReturn(Mono.just(ToolDecision.answer("반갑습니다! 무엇을 도와드릴까요?")));

        // when & then
        StepVerifier.create(chatAgentService.chatWithAgent(conversation))
                .expectNext(AgentEvent.thinking("사용자 의도를 분석하고 있습니다..."))
                .expectNext(AgentEvent.textChunk("반갑습니다! 무엇을 도와드릴까요?"))
                .expectNext(AgentEvent.done())
                .verifyComplete();
    }

    @Test
    @DisplayName("시스템 질문 시 Tool을 호출하고, 실행 결과를 반영하여 최종 답변을 스트리밍한다")
    void chatWithAgent_toolUseAndAnswer() {
        // given
        List<ChatMessage> conversation = List.of(ChatMessage.user("현재 CPU 사용률 알려줘"));
        ToolCallInfo toolCallInfo = new ToolCallInfo("get_system_metrics", Map.of());

        given(toolRegistry.getToolDeclarations()).willReturn(List.of());
        given(geminiLlmPort.decideToolOrDirectAnswer(any(), any()))
                .willReturn(Mono.just(ToolDecision.call(toolCallInfo)));
        given(toolRegistry.executeTool(toolCallInfo))
                .willReturn(Mono.just("{\"cpu\":{\"processCpuUsage\":15.5}}"));
        given(geminiLlmPort.generateStreamingAnswer(any(), eq("get_system_metrics"), any()))
                .willReturn(Flux.just("현재 ", "CPU 사용률은 ", "15.5% 입니다."));

        // when & then
        StepVerifier.create(chatAgentService.chatWithAgent(conversation))
                .expectNext(AgentEvent.thinking("사용자 의도를 분석하고 있습니다..."))
                .expectNext(AgentEvent.toolCall("get_system_metrics", "도구 'get_system_metrics'를 실행하는 중입니다..."))
                .expectNext(AgentEvent.textChunk("현재 "))
                .expectNext(AgentEvent.textChunk("CPU 사용률은 "))
                .expectNext(AgentEvent.textChunk("15.5% 입니다."))
                .expectNext(AgentEvent.done())
                .verifyComplete();
    }
}
