package com.practice.reactive.agent.application.service;

import com.practice.reactive.agent.adapter.out.tools.SystemOpsTools;
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
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatOptions;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatAgentServiceTest {

//    @Mock
//    private GeminiLlmPort geminiLlmPort;
//
//    @Mock
//    private AgentToolRegistry toolRegistry;
//
//    private ChatAgentService chatAgentService;
//
//    @BeforeEach
//    void setUp() {
//        chatAgentService = new ChatAgentService(geminiLlmPort, toolRegistry);
//    }
//
//    @Test
//    @DisplayName("일반 질문 시 Tool 호출 없이 바로 답변 스트림을 반환한다")
//    void chatWithAgent_directAnswer() {
//        // given
//        List<ChatMessage> conversation = List.of(ChatMessage.user("안녕하세요!"));
//        given(toolRegistry.getToolDeclarations()).willReturn(List.of());
//        given(geminiLlmPort.decideToolOrDirectAnswer(any(), any()))
//                .willReturn(Mono.just(ToolDecision.answer("반갑습니다! 무엇을 도와드릴까요?")));
//
//        // when & then
//        StepVerifier.create(chatAgentService.chatWithAgent(conversation))
//                .expectNext(AgentEvent.thinking("사용자 의도를 분석하고 있습니다..."))
//                .expectNext(AgentEvent.textChunk("반갑습니다! 무엇을 도와드릴까요?"))
//                .expectNext(AgentEvent.done())
//                .verifyComplete();
//    }
//
//    @Test
//    @DisplayName("시스템 질문 시 Tool을 호출하고, 실행 결과를 반영하여 최종 답변을 스트리밍한다")
//    void chatWithAgent_toolUseAndAnswer() {
//        // given
//        List<ChatMessage> conversation = List.of(ChatMessage.user("현재 CPU 사용률 알려줘"));
//        ToolCallInfo toolCallInfo = new ToolCallInfo("get_system_metrics", Map.of());
//
//        given(toolRegistry.getToolDeclarations()).willReturn(List.of());
//        given(geminiLlmPort.decideToolOrDirectAnswer(any(), any()))
//                .willReturn(Mono.just(ToolDecision.call(toolCallInfo)));
//        given(toolRegistry.executeTool(toolCallInfo))
//                .willReturn(Mono.just("{\"cpu\":{\"processCpuUsage\":15.5}}"));
//        given(geminiLlmPort.generateStreamingAnswer(any(), eq("get_system_metrics"), any()))
//                .willReturn(Flux.just("현재 ", "CPU 사용률은 ", "15.5% 입니다."));
//
//        // when & then
//        StepVerifier.create(chatAgentService.chatWithAgent(conversation))
//                .expectNext(AgentEvent.thinking("사용자 의도를 분석하고 있습니다..."))
//                .expectNext(AgentEvent.toolCall("get_system_metrics", "도구 'get_system_metrics'를 실행하는 중입니다..."))
//                .expectNext(AgentEvent.textChunk("현재 "))
//                .expectNext(AgentEvent.textChunk("CPU 사용률은 "))
//                .expectNext(AgentEvent.textChunk("15.5% 입니다."))
//                .expectNext(AgentEvent.done())
//                .verifyComplete();
//    }
    @Mock
    private ChatModel chatModel;

    @Mock
    private SystemOpsTools systemOpsTools;

    private ChatAgentService chatAgentService;

    @BeforeEach
    void setUp() {
        chatAgentService = new ChatAgentService(chatModel, systemOpsTools);
    }
    @Test
    @DisplayName("사용자 질문 시 Thinking 이벤트 후 Spring AI의 텍스트와 DONE을 순차 방출한다")
    void chatWithAgent_streamingResponse() {
        // given
        List<ChatMessage> conversation = List.of(ChatMessage.user("현재 시스템 상태 알려줘"));
        ChatResponse chunk1 = new ChatResponse(List.of(new Generation(new AssistantMessage("현재 "))));
        ChatResponse chunk2 = new ChatResponse(List.of(new Generation(new AssistantMessage("시스템은 정상입니다."))));
        // ChatModel.stream() 모킹
        given(chatModel.stream(any(Prompt.class))).willReturn(Flux.just(chunk1, chunk2));
        // when & then (StepVerifier)
        when(chatModel.getOptions()).thenReturn(OpenAiChatOptions.builder().build());
        StepVerifier.create(chatAgentService.chatWithAgent(conversation))
                .expectNext(AgentEvent.thinking("시스템 상태 분석 및 답변을 생성하고 있습니다..."))
                .expectNext(AgentEvent.textChunk("현재 "))
                .expectNext(AgentEvent.textChunk("시스템은 정상입니다."))
                .expectNext(AgentEvent.done())
                .verifyComplete();
    }
    @Test
    @DisplayName("빈 대화 목록이 들어오면 즉시 DONE을 반환한다")
    void chatWithAgent_emptyConversation() {
        StepVerifier.create(chatAgentService.chatWithAgent(List.of()))
                .expectNext(AgentEvent.done())
                .verifyComplete();
    }
}
