package com.repolens.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

@Validated
@ConfigurationProperties(prefix = "repolens")
public class RepoLensProperties {

    @Valid
    private final Upload upload = new Upload();

    @Valid
    private final Cors cors = new Cors();

    public Upload getUpload() {
        return upload;
    }

    public Cors getCors() {
        return cors;
    }

    public static class Upload {

        @NotNull
        private DataSize maxSize = DataSize.ofMegabytes(5);

        public long getMaxBytes() {
            return maxSize.toBytes();
        }

        public void setMaxBytes(long maxBytes) {
            this.maxSize = DataSize.ofBytes(maxBytes);
        }

        public DataSize getMaxSize() {
            return maxSize;
        }

        public void setMaxSize(DataSize maxSize) {
            this.maxSize = maxSize;
        }
    }

    public static class Cors {

        @NotEmpty
        private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:5173"));

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }
}
