package com.repolens.exception;

public class ProjectNotFoundException extends RuntimeException {

    public ProjectNotFoundException(long id) {
        super("Project " + id + " was not found");
    }
}
