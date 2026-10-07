package com.repolens.dto;

import java.time.Instant;

public record ProjectSummaryResponse(
        Long id,
        String name,
        String fileName,
        Instant createdAt,
        Instant updatedAt
) {
}
