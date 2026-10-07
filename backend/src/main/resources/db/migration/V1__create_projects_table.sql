CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    raw_markdown TEXT NOT NULL,
    parsed_tree JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_projects_created_at ON projects (created_at DESC);
