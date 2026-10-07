package com.repolens.exception;

public class FileTooLargeException extends RuntimeException {

    public FileTooLargeException(long maximumBytes) {
        super("Markdown file exceeds the maximum size of " + maximumBytes + " bytes");
    }
}
