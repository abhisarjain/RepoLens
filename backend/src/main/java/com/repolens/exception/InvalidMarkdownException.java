package com.repolens.exception;

public class InvalidMarkdownException extends RuntimeException {

    public InvalidMarkdownException(String message) {
        super(message);
    }

    public InvalidMarkdownException(String message, Throwable cause) {
        super(message, cause);
    }
}
