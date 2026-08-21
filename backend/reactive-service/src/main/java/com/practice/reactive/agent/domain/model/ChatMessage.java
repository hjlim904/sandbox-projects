package com.practice.reactive.agent.domain.model;

public record ChatMessage(
    String role, // "user", "model", "system"
    String content
) {
    public static ChatMessage user(String content) {
        return new ChatMessage("user", content);
    }

    public static ChatMessage model(String content) {
        return new ChatMessage("model", content);
    }
}
