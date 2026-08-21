package com.practice.reactive.agent.domain.model;

public record AgentEvent(
    String type, // "THINKING", "TOOL_CALL", "TEXT_CHUNK", "DONE", "ERROR"
    String content, // 텍스트 내용 또는 도구 실행 결과
    String toolName // 도구(예: "get_system_metrics", 없을 경우 null)
) {
    public static AgentEvent thinking(String message) {
        return new AgentEvent("THINKING", message, null);
    }

    public static AgentEvent toolCall(String toolName, String input) {
        return new AgentEvent("TOOL_CALL", input, toolName);
    }

    public static AgentEvent textChunk(String text) {
        return new AgentEvent("TEXT_CHUNK", text, null);
    }

    public static AgentEvent done() {
        return new AgentEvent("DONE", "", null);
    }

    public static AgentEvent error(String error) {
        return new AgentEvent("ERROR", error, null);
    }
}
