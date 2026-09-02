package com.practice.reactive.agent.adapter.out;

import com.practice.reactive.agent.adapter.out.tools.SystemOpsTools;
import com.practice.reactive.agent.application.port.out.GeminiLlmPort;
import com.practice.reactive.agent.domain.model.ChatMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@Primary // 우선 주입
public class SpringAiAgentAdapter implements GeminiLlmPort {

    private final ChatClient chatClient;

    public SpringAiAgentAdapter(ChatModel chatModel, SystemOpsTools systemOpsTools) {
        this.chatClient = ChatClient.builder(chatModel)
                .defaultSystem("당신은 Spring 백엔드 시스템 진단 및 상태를 전문으로 관리하는 AI 어시스턴트입니다. " +
                               "필요 시 시스템 도구를 활용하여 핵심 상태와 개선점, 권장 조치를 명확하고 친절한 마크다운 형식으로 설명해주세요.")
                .defaultTools(systemOpsTools) // @Tool을 기본 도구로 지정
                .build();
    }

    @Override
    public Mono<ToolDecision> decideToolOrDirectAnswer(List<ChatMessage> history, List<Map<String, Object>> toolsDeclarations) {
        // Spring AI는 도구 결정과 실행을 내부 파이프라인에서 자동으로 결합 처리하므로
        // 바로 단일 의사결정 모드로 변환하거나 스트리밍 패스로 직접 넘깁니다.
        return Mono.just(ToolDecision.answer("Spring AI Tool Runner Active"));
    }

    @Override
    public Flux<String> generateStreamingAnswer(List<ChatMessage> history, String toolName, String toolResult) {
        if (history.isEmpty()) return Flux.empty();

        String lastUserPrompt = history.get(history.size() - 1).content();

        return chatClient.prompt()
                .user(lastUserPrompt)
                .stream()
                .content();
    }
}
