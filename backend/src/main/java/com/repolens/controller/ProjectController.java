package com.repolens.controller;

import com.repolens.dto.ProjectResponse;
import com.repolens.dto.ProjectSummaryResponse;
import com.repolens.service.ProjectService;
import jakarta.validation.constraints.Positive;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProjectResponse> create(@RequestPart("file") MultipartFile file) {
        ProjectResponse response = projectService.create(file);
        return ResponseEntity.created(projectUri(response.id())).body(response);
    }

    @PostMapping("/demo")
    public ResponseEntity<ProjectResponse> createDemo() {
        ProjectResponse response = projectService.createDemo();
        return ResponseEntity.created(projectUri(response.id())).body(response);
    }

    @GetMapping
    public List<ProjectSummaryResponse> findAll() {
        return projectService.findAll();
    }

    @GetMapping("/{id}")
    public ProjectResponse findById(@PathVariable @Positive long id) {
        return projectService.findById(id);
    }

    @PutMapping(value = "/{id}/readme", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectResponse replaceReadme(
            @PathVariable @Positive long id,
            @RequestPart("file") MultipartFile file
    ) {
        return projectService.replaceReadme(id, file);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Positive long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private URI projectUri(long id) {
        return URI.create("/api/projects/" + id);
    }
}
