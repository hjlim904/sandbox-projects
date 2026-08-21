package com.practice.reactive.agent.domain.model;

import java.util.Map;

public record ToolCallInfo(
    String name, // "get_system_metrics" 등
    Map<String, Object> args
) {}
