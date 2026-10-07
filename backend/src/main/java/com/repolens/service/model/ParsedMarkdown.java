package com.repolens.service.model;

import com.repolens.dto.ReadmeContentDto;

import java.util.List;

public record ParsedMarkdown(
        List<ParsedHeading> headings,
        List<ReadmeContentDto> documentContent
) {
}
