package com.practice.reactive.board.adapter.out.r2dbc.repository;

import com.practice.reactive.board.adapter.out.r2dbc.entity.PostEntity;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

public interface SpringDataPostRepository extends R2dbcRepository<PostEntity, Long> {
    
    // R2DBC Page 쿼리 (최신순 정렬)
    @Query("SELECT * FROM posts ORDER BY id DESC LIMIT :limit OFFSET :offset")
    Flux<PostEntity> findAllPaged(int limit, long offset);
}
