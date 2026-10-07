package com.repolens.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            ProjectNotFoundException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler(InvalidMarkdownException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidMarkdown(
            InvalidMarkdownException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.BAD_REQUEST, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler({FileTooLargeException.class, MaxUploadSizeExceededException.class})
    public ResponseEntity<ApiErrorResponse> handleFileTooLarge(
            Exception exception,
            HttpServletRequest request
    ) {
        String message = exception instanceof FileTooLargeException
                ? exception.getMessage()
                : "The uploaded Markdown file exceeds the configured size limit";
        return error(HttpStatus.PAYLOAD_TOO_LARGE, message, request, Map.of());
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingPart(
            MissingServletRequestPartException exception,
            HttpServletRequest request
    ) {
        return error(
                HttpStatus.BAD_REQUEST,
                "A multipart form field named '" + exception.getRequestPartName() + "' is required",
                request,
                Map.of()
        );
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiErrorResponse> handleMultipart(
            MultipartException exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.BAD_REQUEST, "The multipart upload could not be read", request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return error(HttpStatus.BAD_REQUEST, "Request validation failed", request, fieldErrors);
    }

    @ExceptionHandler({
            ConstraintViolationException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class
    })
    public ResponseEntity<ApiErrorResponse> handleBadRequest(
            Exception exception,
            HttpServletRequest request
    ) {
        return error(HttpStatus.BAD_REQUEST, "The request contains an invalid value", request, Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error("Unhandled request failure", exception);
        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected server error occurred",
                request,
                Map.of()
        );
    }

    private ResponseEntity<ApiErrorResponse> error(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors
    ) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                fieldErrors
        ));
    }
}
