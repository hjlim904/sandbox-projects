package com.practice.reactive.board.adapter.in.web.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        int page,
        int size,
        long totalCount,
        int totalPages
) {
    public static <T> PageResponse<T> of(List<T> items, int page, int size, long totalCount) {
        int totalPages = (int) Math.ceil((double) totalCount / size);
        return new PageResponse<>(items, page, size, totalCount, totalPages);
    }
}
