package com.practice.reactive.agent.adapter.out.tools;

import com.practice.reactive.board.port.in.PostQueryUseCase;
import com.practice.reactive.dashboard.application.port.out.CheckComponentHealthPort;
import com.practice.reactive.dashboard.application.port.out.LoadSystemMetricPort;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class SystemOpsTools {

    private final LoadSystemMetricPort loadSystemMetricPort;
    private final CheckComponentHealthPort checkComponentHealthPort;
    private final PostQueryUseCase postQueryUseCase;

    // 시스템 조회
    @Tool(description = "현재 백엔드 서버의 실시간 CPU 사용률(%), JVM Heap 메모리(Bytes), 활성 스레드 수 지표를 조회합니다.")
    public Map<String, Record> getSystemMetrics() {
        return Mono.zip(
                loadSystemMetricPort.loadCpuMetric(),
                loadSystemMetricPort.loadMemoryMetric(),
                loadSystemMetricPort.loadThreadMetric()
        ).map(tuple -> Map.of(
                "cpu", tuple.getT1(),
                "memory", tuple.getT2(),
                "threads", tuple.getT3()
        )).block(); // Spring AI Tool 실행 인터페이스는 동기 반환 지원
    }

    // 헬스체크
    @Tool(description = "R2DBC H2 데이터베이스 및 인증 서버(Auth-Service)의 연결 헬스 상태(UP/DOWN)와 응답 지연 시간(ms)을 점검합니다.")
    public Object checkComponentHealth(
            @ToolParam(description = "조회할 컴포넌트 이름 ('R2DBC-H2', 'AUTH-SERVICE', 또는 전체 조회 시 'ALL')") 
            String componentName
    ) {
        String target = (componentName != null && !componentName.isBlank()) ? componentName : "ALL";
        if ("ALL".equalsIgnoreCase(target)) {
            return checkComponentHealthPort.checkAllComponents().collectList().block();
        }
        return checkComponentHealthPort.checkSpecificComponent(target).block();
    }

    // R2DBC 게시판 글 검색
    @Tool(description = "R2DBC 게시판에서 최근 등록된 게시글 목록을 조회하거나 키워드로 검색합니다.")
    public Map<String, Object> searchBoardPosts(
            @ToolParam(description = "검색할 키워드 (비어있으면 최근 글 전체 조회)") 
            String keyword,
            @ToolParam(description = "가져올 게시글 개수 (기본값: 5)") 
            Integer limit
    ) {
        int max = (limit != null && limit > 0) ? limit : 5;
        String kw = (keyword != null) ? keyword : "";

        var posts = postQueryUseCase.getPosts(0, max)
                .filter(post -> kw.isBlank() || post.title().contains(kw) || post.content().contains(kw))
                .collectList()
                .block();

        return Map.of(
                "totalFound", (posts != null) ? posts.size() : 0,
                "posts", (posts != null) ? posts : java.util.List.of()
        );
    }
}
