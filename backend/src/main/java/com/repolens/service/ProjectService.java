package com.repolens.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.repolens.config.RepoLensProperties;
import com.repolens.dto.ProjectResponse;
import com.repolens.dto.ProjectSummaryResponse;
import com.repolens.dto.ReadmeDocumentDto;
import com.repolens.entity.Project;
import com.repolens.exception.FileTooLargeException;
import com.repolens.exception.InvalidMarkdownException;
import com.repolens.exception.ProjectNotFoundException;
import com.repolens.repository.ProjectRepository;
import com.repolens.service.model.ParsedMarkdown;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class ProjectService {

    private static final String DEMO_RESOURCE = "classpath:demo/DEMO_README.md";
    private static final String DEMO_FILE_NAME = "DEMO_README.md";

    private final ProjectRepository repository;
    private final MarkdownParserService parser;
    private final HeadingTreeBuilder treeBuilder;
    private final ObjectMapper objectMapper;
    private final RepoLensProperties properties;
    private final ResourceLoader resourceLoader;

    public ProjectService(
            ProjectRepository repository,
            MarkdownParserService parser,
            HeadingTreeBuilder treeBuilder,
            ObjectMapper objectMapper,
            RepoLensProperties properties,
            ResourceLoader resourceLoader
    ) {
        this.repository = repository;
        this.parser = parser;
        this.treeBuilder = treeBuilder;
        this.objectMapper = objectMapper;
        this.properties = properties;
        this.resourceLoader = resourceLoader;
    }

    @Transactional
    public ProjectResponse create(MultipartFile file) {
        UploadedMarkdown upload = readUpload(file);
        return createStoredProject(upload.fileName(), upload.markdown());
    }

    @Transactional
    public ProjectResponse createDemo() {
        Resource resource = resourceLoader.getResource(DEMO_RESOURCE);
        try (InputStream inputStream = resource.getInputStream()) {
            byte[] bytes = inputStream.readAllBytes();
            validateSize(bytes.length);
            return createStoredProject(DEMO_FILE_NAME, decodeUtf8(bytes));
        } catch (IOException exception) {
            throw new IllegalStateException("The bundled demo README could not be loaded", exception);
        }
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> findAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(long id) {
        return toResponse(findProject(id));
    }

    @Transactional
    public ProjectResponse replaceReadme(long id, MultipartFile file) {
        UploadedMarkdown upload = readUpload(file);
        ReadmeDocumentDto document = parseDocument(upload.fileName(), upload.markdown());
        Project project = findProject(id);

        project.setName(deriveProjectName(document, upload.fileName()));
        project.setFileName(upload.fileName());
        project.setRawMarkdown(upload.markdown());
        project.setParsedTree(objectMapper.valueToTree(document));
        project.setUpdatedAt(Instant.now());

        return toResponse(repository.saveAndFlush(project));
    }

    @Transactional
    public void delete(long id) {
        Project project = findProject(id);
        repository.delete(project);
    }

    private ProjectResponse createStoredProject(String fileName, String markdown) {
        validateMarkdownContent(markdown);
        ReadmeDocumentDto document = parseDocument(fileName, markdown);

        Project project = new Project();
        project.setName(deriveProjectName(document, fileName));
        project.setFileName(fileName);
        project.setRawMarkdown(markdown);
        project.setParsedTree(objectMapper.valueToTree(document));

        return toResponse(repository.saveAndFlush(project));
    }

    private ReadmeDocumentDto parseDocument(String fileName, String markdown) {
        ParsedMarkdown parsedMarkdown = parser.parse(markdown);
        return treeBuilder.build(fileName, parsedMarkdown);
    }

    private UploadedMarkdown readUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidMarkdownException("Choose a non-empty Markdown file");
        }

        String fileName = sanitizeFileName(file.getOriginalFilename());
        validateExtension(fileName);
        validateSize(file.getSize());

        try {
            byte[] bytes = file.getBytes();
            validateSize(bytes.length);
            String markdown = decodeUtf8(bytes);
            validateMarkdownContent(markdown);
            return new UploadedMarkdown(fileName, markdown);
        } catch (IOException exception) {
            throw new InvalidMarkdownException("The uploaded Markdown file could not be read", exception);
        }
    }

    private String sanitizeFileName(String originalFileName) {
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new InvalidMarkdownException("The uploaded file must have a file name");
        }

        String normalized = originalFileName.replace('\\', '/');
        String fileName = normalized.substring(normalized.lastIndexOf('/') + 1).trim();
        if (fileName.isBlank()) {
            throw new InvalidMarkdownException("The uploaded file must have a file name");
        }
        return fileName;
    }

    private void validateExtension(String fileName) {
        String lower = fileName.toLowerCase(Locale.ROOT);
        if (!(lower.endsWith(".md") || lower.endsWith(".markdown"))) {
            throw new InvalidMarkdownException("Only .md and .markdown files are supported");
        }
        if (fileStem(fileName).isBlank()) {
            throw new InvalidMarkdownException("The uploaded Markdown file must have a name");
        }
    }

    private void validateSize(long size) {
        if (size > properties.getUpload().getMaxBytes()) {
            throw new FileTooLargeException(properties.getUpload().getMaxBytes());
        }
    }

    private void validateMarkdownContent(String markdown) {
        if (markdown == null || markdown.isBlank()) {
            throw new InvalidMarkdownException("The Markdown file does not contain any content");
        }
    }

    private String decodeUtf8(byte[] bytes) {
        try {
            String markdown = StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes))
                    .toString();
            return markdown.startsWith("\uFEFF") ? markdown.substring(1) : markdown;
        } catch (CharacterCodingException exception) {
            throw new InvalidMarkdownException("The Markdown file must use UTF-8 encoding", exception);
        }
    }

    private Project findProject(long id) {
        return repository.findById(id).orElseThrow(() -> new ProjectNotFoundException(id));
    }

    private String deriveProjectName(ReadmeDocumentDto document, String fileName) {
        if (!document.roots().isEmpty() && !document.roots().getFirst().title().isBlank()) {
            return document.roots().getFirst().title();
        }
        return fileStem(fileName);
    }

    private String fileStem(String fileName) {
        String lower = fileName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".markdown")) {
            return fileName.substring(0, fileName.length() - ".markdown".length());
        }
        if (lower.endsWith(".md")) {
            return fileName.substring(0, fileName.length() - ".md".length());
        }
        return fileName;
    }

    private ProjectSummaryResponse toSummary(Project project) {
        return new ProjectSummaryResponse(
                project.getId(),
                project.getName(),
                project.getFileName(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    private ProjectResponse toResponse(Project project) {
        ReadmeDocumentDto document = objectMapper.convertValue(
                project.getParsedTree(),
                ReadmeDocumentDto.class
        );
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getFileName(),
                project.getRawMarkdown(),
                document,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    private record UploadedMarkdown(String fileName, String markdown) {
    }
}
