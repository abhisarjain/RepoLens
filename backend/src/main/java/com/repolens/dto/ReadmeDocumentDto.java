package com.repolens.dto;

import java.util.List;

public record ReadmeDocumentDto(
        String fileName,
        List<ReadmeNodeDto> roots,
        List<ReadmeContentDto> content,
        boolean hasHeadings
) {

    public ReadmeDocumentDto(String fileName, List<ReadmeNodeDto> roots, List<ReadmeContentDto> content) {
        this(fileName, roots, content, !roots.isEmpty());
    }
}
