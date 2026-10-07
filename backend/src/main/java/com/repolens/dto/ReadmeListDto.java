package com.repolens.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ReadmeListDto(
        boolean ordered,
        Integer start,
        List<ReadmeListItemDto> items
) {
}
