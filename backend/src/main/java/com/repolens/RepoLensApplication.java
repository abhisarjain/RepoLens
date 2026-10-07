package com.repolens;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class RepoLensApplication {

    public static void main(String[] args) {
        SpringApplication.run(RepoLensApplication.class, args);
    }
}
