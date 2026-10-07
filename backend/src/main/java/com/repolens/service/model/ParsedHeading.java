package com.repolens.service.model;

import com.repolens.dto.ReadmeContentDto;

import java.util.List;

public record ParsedHeading(
        String title,
        int level,
        List<ReadmeContentDto> content
) {
}
