package com.practice.reactive.agent.adapter.out;

import com.practice.reactive.agent.application.port.out.GeminiLlmPort;
import com.practice.reactive.agent.domain.model.ChatMessage;
import com.practice.reactive.agent.domain.model.ToolCallInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GeminiClientAdapter implements GeminiLlmPort {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiClientAdapter(
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model:gemini-2.5-flash}") String model,
            @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    public Mono<ToolDecision> decideToolOrDirectAnswer(List<ChatMessage> history, List<Map<String, Object>> toolsDeclarations) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", toGeminiContents(history));

        if (!toolsDeclarations.isEmpty()) {
            requestBody.put("tools", List.of(Map.of("functionDeclarations", toolsDeclarations)));
        }

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/{model}:generateContent")
                        .queryParam("key", apiKey)
                        .build(model))
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseDecisionResponse)
                .onErrorResume(e -> {
                    log.error("Gemini API Error", e);
                    return Mono.just(ToolDecision.answer("Gemini API 호출 중 문제가 발생했습니다: " + e.getMessage()));
                });
    }

    @Override
    public Flux<String> generateStreamingAnswer(List<ChatMessage> history, String toolName, String toolResult) {
        List<Map<String, Object>> contents = new ArrayList<>(toGeminiContents(history));

        // Tool 실행 결과를 Gemini 대화 맥락에 FunctionResponse로 추가
        contents.add(Map.of(
                "role", "function",
                "parts", List.of(Map.of(
                        "functionResponse", Map.of(
                                "name", toolName,
                                "response", Map.of("content", toolResult)
                        )
                ))
        ));

        Map<String, Object> requestBody = Map.of(
                "contents", contents,
                "systemInstruction", Map.of("parts", List.of(Map.of(
                        "text", "당신은 Spring 백엔드 시스템 진단 및 상태를 전문으로 관리하는 AI Ops 어시스턴트입니다. " +
                                "도구(Tool)의 실행 결과를 바탕으로 핵심 상태와 개선점, 권장 조치를 명확하고 친절한 마크다운 형식으로 설명해주세요."
                )))
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/{model}:streamGenerateContent")
                        .queryParam("alt", "sse")
                        .queryParam("key", apiKey)
                        .build(model))
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .flatMap(this::extractTextFromSseChunk);
    }

    private List<Map<String, Object>> toGeminiContents(List<ChatMessage> history) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (ChatMessage msg : history) {
            String role = "user".equalsIgnoreCase(msg.role()) ? "user" : "model";
            list.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", msg.content()))
            ));
        }
        return list;
    }

    private ToolDecision parseDecisionResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode candidate = root.path("candidates").get(0).path("content").path("parts").get(0);

            // Function Call 여부 확인
            if (candidate.has("functionCall")) {
                JsonNode funcCall = candidate.path("functionCall");
                String name = funcCall.path("name").asText();
                Map<String, Object> args = new HashMap<>();
                if (funcCall.has("args")) {
                    funcCall.path("args").properties().forEach(entry ->
                            args.put(entry.getKey(), entry.getValue().asText())
                    );
                }
                return ToolDecision.call(new ToolCallInfo(name, args));
            }

            // 일반 텍스트 답변인 경우
            String text = candidate.path("text").asText("답변을 생성할 수 없습니다.");
            return ToolDecision.answer(text);
        } catch (Exception e) {
            log.error("Failed to parse Gemini response", e);
            return ToolDecision.answer("응답 파싱 오류: " + e.getMessage());
        }
    }

    private Flux<String> extractTextFromSseChunk(String chunk) {
        try {
            if (chunk.isBlank() || !chunk.contains("candidates")) {
                return Flux.empty();
            }
            JsonNode root = objectMapper.readTree(chunk);
            JsonNode textNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            if (!textNode.isMissingNode() && !textNode.asText().isEmpty()) {
                return Flux.just(textNode.asText());
            }
        } catch (Exception ignored) {
        }
        return Flux.empty();
    }
}
