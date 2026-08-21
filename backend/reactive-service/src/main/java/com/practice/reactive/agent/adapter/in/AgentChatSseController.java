package com.practice.reactive.agent.adapter.in;

import com.practice.reactive.agent.application.port.in.ChatAgentUseCase;
import com.practice.reactive.agent.domain.model.AgentEvent;
import com.practice.reactive.agent.domain.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AgentChatSseController {

    private final ChatAgentUseCase chatAgentUseCase;

    /**
     * AI 에이전트 대화 및 실시간 SSE 스트리밍
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<AgentEvent>> streamChat(@RequestBody ChatRequest request) {
        List<ChatMessage> history = request.history() != null ? request.history() : List.of();
        ChatMessage current = ChatMessage.user(request.message());

        List<ChatMessage> fullConversation = new java.util.ArrayList<>(history);
        fullConversation.add(current);

        return chatAgentUseCase.chatWithAgent(fullConversation)
                .map(event -> ServerSentEvent.<AgentEvent>builder()
                        .event("agent-event")
                        .data(event)
                        .build());
    }

    public record ChatRequest(
        String message,
        List<ChatMessage> history
    ) {}
}
