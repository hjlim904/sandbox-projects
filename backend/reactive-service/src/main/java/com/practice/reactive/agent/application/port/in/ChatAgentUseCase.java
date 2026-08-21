package com.practice.reactive.agent.application.port.in;

import com.practice.reactive.agent.domain.model.AgentEvent;
import com.practice.reactive.agent.domain.model.ChatMessage;
import reactor.core.publisher.Flux;

import java.util.List;

public interface ChatAgentUseCase {
    //대화 내역을 받아 Function Calling 판별, Agent 이벤트 스트림 반환
    Flux<AgentEvent> chatWithAgent(List<ChatMessage> conversation);
}
