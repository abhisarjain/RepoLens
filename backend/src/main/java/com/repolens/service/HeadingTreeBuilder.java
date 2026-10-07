package com.repolens.service;

import com.repolens.dto.ReadmeDocumentDto;
import com.repolens.dto.ReadmeNodeDto;
import com.repolens.service.model.ParsedHeading;
import com.repolens.service.model.ParsedMarkdown;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

@Component
public class HeadingTreeBuilder {

    public ReadmeDocumentDto build(String fileName, ParsedMarkdown parsedMarkdown) {
        List<MutableNode> roots = new ArrayList<>();
        Deque<MutableNode> ancestors = new ArrayDeque<>();
        int sequence = 1;

        for (ParsedHeading heading : parsedMarkdown.headings()) {
            while (!ancestors.isEmpty() && ancestors.peek().level >= heading.level()) {
                ancestors.pop();
            }

            MutableNode node = new MutableNode(
                    "node-" + sequence++,
                    heading.title(),
                    heading.level(),
                    heading.content()
            );

            if (ancestors.isEmpty()) {
                roots.add(node);
            } else {
                ancestors.peek().children.add(node);
            }
            ancestors.push(node);
        }

        return new ReadmeDocumentDto(
                fileName,
                roots.stream().map(this::toDto).toList(),
                List.copyOf(parsedMarkdown.documentContent())
        );
    }

    private ReadmeNodeDto toDto(MutableNode node) {
        return new ReadmeNodeDto(
                node.id,
                node.title,
                node.level,
                List.copyOf(node.content),
                node.children.stream().map(this::toDto).toList()
        );
    }

    private static final class MutableNode {

        private final String id;
        private final String title;
        private final int level;
        private final List<com.repolens.dto.ReadmeContentDto> content;
        private final List<MutableNode> children = new ArrayList<>();

        private MutableNode(
                String id,
                String title,
                int level,
                List<com.repolens.dto.ReadmeContentDto> content
        ) {
            this.id = id;
            this.title = title;
            this.level = level;
            this.content = content;
        }
    }
}
