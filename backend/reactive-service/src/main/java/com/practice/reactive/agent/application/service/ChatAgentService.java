package com.practice.reactive.agent.application.service;

import com.practice.reactive.agent.application.port.in.ChatAgentUseCase;
import com.practice.reactive.agent.application.port.out.GeminiLlmPort;
import com.practice.reactive.agent.domain.model.AgentEvent;
import com.practice.reactive.agent.domain.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatAgentService implements ChatAgentUseCase {

    private final GeminiLlmPort geminiLlmPort;
    private final AgentToolRegistry toolRegistry;

    @Override
    public Flux<AgentEvent> chatWithAgent(List<ChatMessage> conversation) {
        // 1. 초기 "생각 중..." 이벤트 방출
        Flux<AgentEvent> initialThinking = Flux.just(AgentEvent.thinking("사용자 의도를 분석하고 있습니다..."));

        // 2. Gemini에게 Tool Call 여부 판단 요청
        Flux<AgentEvent> agentFlow = geminiLlmPort.decideToolOrDirectAnswer(conversation, toolRegistry.getToolDeclarations())
                .flatMapMany(decision -> {
                    // Tool Call이 필요한 경우
                    if (decision.hasToolCall()) {
                        String toolName = decision.toolCallInfo().name();
                        log.info("Agent decided to call tool: {}", toolName);

                        AgentEvent toolEvent = AgentEvent.toolCall(
                                toolName,
                                "도구 '" + toolName + "'를 실행하는 중입니다..."
                        );

                        return Flux.concat(
                                Flux.just(toolEvent),
                                toolRegistry.executeTool(decision.toolCallInfo())
                                        .flatMapMany(toolResult -> {
                                            log.info("Tool executed. Result length: {}", toolResult.length());
                                            return geminiLlmPort.generateStreamingAnswer(conversation, toolName, toolResult)
                                                    .map(AgentEvent::textChunk);
                                        })
                        );
                    }

                    // Tool Call이 필요 없는 일반 질문인 경우
                    return Flux.just(AgentEvent.textChunk(decision.directAnswer()));
                })
                .concatWith(Flux.just(AgentEvent.done()))
                .onErrorResume(err -> {
                    log.error("Agent error", err);
                    return Flux.just(
                            AgentEvent.error("에이전트 처리 중 오류가 발생했습니다: " + err.getMessage()),
                            AgentEvent.done()
                    );
                });

        return Flux.concat(initialThinking, agentFlow);
    }
}
