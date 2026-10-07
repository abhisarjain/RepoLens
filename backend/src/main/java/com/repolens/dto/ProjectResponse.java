package com.repolens.dto;

import java.time.Instant;

public record ProjectResponse(
        Long id,
        String name,
        String fileName,
        String rawMarkdown,
        ReadmeDocumentDto document,
        Instant createdAt,
        Instant updatedAt
) {
}
