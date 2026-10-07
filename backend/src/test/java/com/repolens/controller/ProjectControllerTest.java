package com.repolens.controller;

import com.repolens.dto.ProjectResponse;
import com.repolens.dto.ReadmeDocumentDto;
import com.repolens.dto.ReadmeNodeDto;
import com.repolens.exception.GlobalExceptionHandler;
import com.repolens.exception.InvalidMarkdownException;
import com.repolens.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProjectControllerTest {

    private ProjectService projectService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        projectService = mock(ProjectService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new ProjectController(projectService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createsProjectFromMultipartMarkdown() throws Exception {
        ReadmeNodeDto root = new ReadmeNodeDto("node-1", "RepoLens", 1, List.of(), List.of());
        ReadmeDocumentDto document = new ReadmeDocumentDto(
                "README.md",
                List.of(root),
                List.of()
        );
        ProjectResponse response = new ProjectResponse(
                7L,
                "RepoLens",
                "README.md",
                "# RepoLens",
                document,
                Instant.parse("2025-01-01T00:00:00Z"),
                Instant.parse("2025-01-01T00:00:00Z")
        );
        when(projectService.create(any())).thenReturn(response);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "README.md",
                "text/markdown",
                "# RepoLens".getBytes()
        );

        mockMvc.perform(multipart("/api/projects").file(file))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/projects/7"))
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.document.roots[0].title").value("RepoLens"));
    }

    @Test
    void returnsUsefulValidationErrorForInvalidUpload() throws Exception {
        when(projectService.create(any()))
                .thenThrow(new InvalidMarkdownException("Only .md and .markdown files are supported"));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "README.txt",
                "text/plain",
                "not markdown".getBytes()
        );

        mockMvc.perform(multipart("/api/projects").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message")
                        .value("Only .md and .markdown files are supported"));
    }
}
