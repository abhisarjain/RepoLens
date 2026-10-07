package com.repolens.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReadmeInlineDto(
        String type,
        String rawMarkdown,
        String text,
        String url,
        String alt,
        String title
) {
}
