package com.repolens.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.repolens.config.RepoLensProperties;
import com.repolens.dto.ProjectResponse;
import com.repolens.entity.Project;
import com.repolens.exception.FileTooLargeException;
import com.repolens.exception.InvalidMarkdownException;
import com.repolens.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository repository;

    @Mock
    private ResourceLoader resourceLoader;

    private RepoLensProperties properties;
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        properties = new RepoLensProperties();
        projectService = new ProjectService(
                repository,
                new MarkdownParserService(),
                new HeadingTreeBuilder(),
                new ObjectMapper().findAndRegisterModules(),
                properties,
                resourceLoader
        );

        lenient().when(repository.saveAndFlush(any(Project.class))).thenAnswer(invocation -> {
            Project project = invocation.getArgument(0);
            project.setId(42L);
            project.setCreatedAt(Instant.parse("2025-01-01T00:00:00Z"));
            project.setUpdatedAt(Instant.parse("2025-01-01T00:00:00Z"));
            return project;
        });
    }

    @Test
    void rejectsEmptyUploads() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "README.md",
                "text/markdown",
                new byte[0]
        );

        assertThatThrownBy(() -> projectService.create(file))
                .isInstanceOf(InvalidMarkdownException.class)
                .hasMessageContaining("non-empty");
    }

    @Test
    void rejectsWhitespaceOnlyMarkdown() {
        MockMultipartFile file = markdownFile("README.md", " \n\t ");

        assertThatThrownBy(() -> projectService.create(file))
                .isInstanceOf(InvalidMarkdownException.class)
                .hasMessageContaining("does not contain any content");
    }

    @Test
    void rejectsUnsupportedExtensions() {
        MockMultipartFile file = markdownFile("README.txt", "# Project");

        assertThatThrownBy(() -> projectService.create(file))
                .isInstanceOf(InvalidMarkdownException.class)
                .hasMessageContaining(".md and .markdown");
    }

    @Test
    void rejectsFilesAboveTheConfiguredLimit() {
        properties.getUpload().setMaxBytes(4);
        MockMultipartFile file = markdownFile("README.md", "# Large");

        assertThatThrownBy(() -> projectService.create(file))
                .isInstanceOf(FileTooLargeException.class)
                .hasMessageContaining("4 bytes");
    }

    @Test
    void derivesMetadataNameFromFirstHeadingAndPersistsNormalizedDocument() {
        MockMultipartFile file = markdownFile("README.md", """
                # Why This Broke at 3AM

                Details.
                """);

        ProjectResponse response = projectService.create(file);

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.name()).isEqualTo("Why This Broke at 3AM");
        assertThat(response.document().roots()).hasSize(1);
        assertThat(response.document().roots().getFirst().title())
                .isEqualTo("Why This Broke at 3AM");
        assertThat(response.rawMarkdown()).contains("Details.");
    }

    @Test
    void usesOnlyFilenameStemAsMetadataFallbackForHeadinglessMarkdown() {
        ProjectResponse response = projectService.create(markdownFile(
                "notes.markdown",
                "A heading-less document that remains readable."
        ));

        assertThat(response.name()).isEqualTo("notes");
        assertThat(response.document().roots()).isEmpty();
        assertThat(response.document().content()).hasSize(1);
    }

    @Test
    void demoUsesTheBundledReadmeAndTheNormalParserPipeline() {
        when(resourceLoader.getResource("classpath:demo/DEMO_README.md"))
                .thenReturn(new ClassPathResource("demo/DEMO_README.md"));

        ProjectResponse response = projectService.createDemo();

        assertThat(response.name()).isEqualTo("The Clockwork Orchard");
        assertThat(response.document().roots())
                .extracting(node -> node.title())
                .containsExactly("The Clockwork Orchard", "Notes From Another Root");
        assertThat(flattenTitles(response.document().roots()))
                .containsOnlyOnce("Why This Broke at 3AM")
                .filteredOn("Setup"::equals)
                .hasSize(3);
    }

    private java.util.List<String> flattenTitles(java.util.List<com.repolens.dto.ReadmeNodeDto> nodes) {
        java.util.List<String> titles = new java.util.ArrayList<>();
        for (com.repolens.dto.ReadmeNodeDto node : nodes) {
            titles.add(node.title());
            titles.addAll(flattenTitles(node.children()));
        }
        return titles;
    }

    private MockMultipartFile markdownFile(String fileName, String markdown) {
        return new MockMultipartFile(
                "file",
                fileName,
                "text/markdown",
                markdown.getBytes(java.nio.charset.StandardCharsets.UTF_8)
        );
    }
}
