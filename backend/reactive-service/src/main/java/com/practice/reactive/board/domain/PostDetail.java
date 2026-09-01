package com.practice.reactive.board.domain;

import java.util.List;

public record PostDetail(
        Post post,
        List<Comment> comments
) {
}
