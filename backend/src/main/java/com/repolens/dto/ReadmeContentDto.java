package com.repolens.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * A structural Markdown block. {@code rawMarkdown} is always retained so the
 * client can render syntax that is more detailed than the normalized fields.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReadmeContentDto(
        String type,
        String rawMarkdown,
        String text,
        String language,
        String url,
        String alt,
        String title,
        List<ReadmeInlineDto> inlines,
        ReadmeListDto list,
        List<String> headers,
        List<List<String>> rows
) {
}
