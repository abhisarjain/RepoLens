package com.repolens.dto;

import java.util.List;

public record ReadmeNodeDto(
        String id,
        String title,
        int level,
        List<ReadmeContentDto> content,
        List<ReadmeNodeDto> children
) {
}
