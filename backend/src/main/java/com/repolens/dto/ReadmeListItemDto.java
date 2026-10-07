package com.repolens.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReadmeListItemDto(
        String rawMarkdown,
        String text,
        List<ReadmeListDto> children
) {
}
