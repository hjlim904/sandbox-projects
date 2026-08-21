package com.practice.reactive.agent.application.port.out;

import com.practice.reactive.agent.domain.model.ChatMessage;
import com.practice.reactive.agent.domain.model.ToolCallInfo;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

public interface GeminiLlmPort {
    //프롬프트와 Tool 정의를 전달하여, Gemini가 Tool Call을 할지 판단
    Mono<ToolDecision> decideToolOrDirectAnswer(List<ChatMessage> history, List<Map<String, Object>> toolsDeclarations);


    //Tool 실행 결과를 반영하여 최종 답변 텍스트를 실시간 토큰 스트림으로 생성
    Flux<String> generateStreamingAnswer(List<ChatMessage> history, String toolName, String toolResult);

    record ToolDecision(
        boolean hasToolCall,
        ToolCallInfo toolCallInfo,
        String directAnswer
    ) {
        public static ToolDecision call(ToolCallInfo info) {
            return new ToolDecision(true, info, null);
        }

        public static ToolDecision answer(String text) {
            return new ToolDecision(false, null, text);
        }
    }
}
