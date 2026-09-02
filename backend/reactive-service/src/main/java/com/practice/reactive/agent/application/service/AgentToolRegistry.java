package com.practice.reactive.agent.application.service;

import com.practice.reactive.agent.domain.model.ToolCallInfo;
import com.practice.reactive.board.port.in.PostQueryUseCase;
import com.practice.reactive.dashboard.application.port.out.CheckComponentHealthPort;
import com.practice.reactive.dashboard.application.port.out.LoadSystemMetricPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AgentToolRegistry {

    private final LoadSystemMetricPort loadSystemMetricPort;
    private final CheckComponentHealthPort checkComponentHealthPort;
    private final PostQueryUseCase postQueryUseCase;
    private final ObjectMapper objectMapper;

    //Function Declarations
    public List<Map<String, Object>> getToolDeclarations() {
        return List.of(
            Map.of(
                "name", "get_system_metrics",
                "description", "현재 백엔드 서버의 실시간 CPU 사용률(%), JVM Heap 메모리(Bytes), 활성 스레드 수 지표를 조회합니다.",
                "parameters", Map.of(
                    "type", "OBJECT",
                    "properties", Map.of()
                )
            ),
            Map.of(
                "name", "check_component_health",
                "description", "R2DBC H2 데이터베이스 및 인증 서버(Auth-Service)의 연결 헬스 상태(UP/DOWN)와 응답 지연 시간(ms)을 점검합니다.",
                "parameters", Map.of(
                    "type", "OBJECT",
                    "properties", Map.of(
                        "componentName", Map.of(
                            "type", "STRING",
                            "description", "조회할 컴포넌트 이름 ('R2DBC-H2', 'AUTH-SERVICE', 또는 전체 조회 시 'ALL')"
                        )
                    )
                )
            ),
            Map.of(
                    "name", "search_board_posts",
                    "description", "R2DBC 게시판에서 최근 등록된 게시글 목록을 조회하거나 키워드로 검색합니다.",
                    "parameters", Map.of(
                            "type", "OBJECT",
                            "properties", Map.of(
                                    "keyword", Map.of(
                                            "type", "STRING",
                                            "description", "검색할 키워드 (비어있으면 최근 글 조회)"
                                    ),
                                    "limit", Map.of(
                                            "type", "INTEGER",
                                            "description", "가져올 게시글 개수 (기본값: 5)"
                                    )
                            )
                    )
            )
        );
    }

    //Tool 실행
    public Mono<String> executeTool(ToolCallInfo toolCall) {
        String name = toolCall.name();
        
        if ("get_system_metrics".equalsIgnoreCase(name)) {
            return Mono.zip(
                    loadSystemMetricPort.loadCpuMetric(),
                    loadSystemMetricPort.loadMemoryMetric(),
                    loadSystemMetricPort.loadThreadMetric()
            ).map(tuple -> Map.of(
                    "cpu", tuple.getT1(),
                    "memory", tuple.getT2(),
                    "threads", tuple.getT3()
            )).map(this::toJson);
        }

        if ("check_component_health".equalsIgnoreCase(name)) {
            String target = (String) toolCall.args().getOrDefault("componentName", "ALL");
            if ("ALL".equalsIgnoreCase(target)) {
                return checkComponentHealthPort.checkAllComponents()
                        .collectList()
                        .map(this::toJson);
            }
            return checkComponentHealthPort.checkSpecificComponent(target)
                    .map(this::toJson);
        }

        if ("search_board_posts".equalsIgnoreCase(name)) {
            String keyword = (String) toolCall.args().getOrDefault("keyword", "");
            int limit = 5;
            if (toolCall.args().containsKey("limit")) {
                try {
                    limit = Integer.parseInt(toolCall.args().get("limit").toString());
                } catch (Exception ignored) {}
            }
            return postQueryUseCase.getPosts(0, limit)
                    .filter(post -> keyword.isBlank() || post.title().contains(keyword) || post.content().contains(keyword))
                    .collectList()
                    .map(posts -> Map.of("totalFound", posts.size(), "posts", posts))
                    .map(this::toJson);
        }

        return Mono.just("{\"error\": \"Unknown tool: " + name + "\"}");
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{\"error\":\"Serialization error\"}";
        }
    }
}
