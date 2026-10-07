# RepoLens

RepoLens turns the heading hierarchy already present in a Markdown README into an interactive node world. Upload a `.md` or `.markdown` file, move through its headings in Focus mode, inspect the complete hierarchy in Full Map mode, search its original content, and return later through its persisted project ID.

RepoLens is deliberately structural: it does not use AI, summarize text, classify headings, or invent relationships. Heading text stays unchanged, heading depth defines the tree, and each node shows only the content owned by that heading.

## What You Can Explore

- Drag and drop a README or choose one from disk.
- Travel through direct child headings in a radial Focus view.
- Pan, zoom, and fit the complete hierarchy in Full Map view.
- Jump through the outline, clickable breadcrumbs, search results, or keyboard navigation.
- Read paragraphs, lists, tables, links, images, quotes, and highlighted code associated with the selected heading.
- Reload, replace, or delete projects stored in PostgreSQL.
- Launch the bundled demo through the same parsing and persistence pipeline as an uploaded file.

## Architecture

```text
README.md
    |
    | multipart/form-data
    v
React + TypeScript + Vite (5173)
    |
    | REST /api
    v
Spring Boot API (8080)
    |
    +--> flexmark-java AST
    |        |
    |        v
    |    heading tree + owned content blocks
    |        |
    +--------+---------------------+
             |                     |
             v                     v
       PostgreSQL JSONB       API response
       + raw Markdown              |
                                  v
                         React Flow explorer
```

The backend owns validation, Markdown parsing, hierarchy construction, JSON serialization, and persistence. The frontend consumes the normalized tree and owns layout, navigation, rendering, and deterministic local search.

### Repository Layout

```text
.
├── backend/             Spring Boot API, Flyway migrations, and parser tests
├── demo/README.md       Canonical Markdown feature fixture
├── frontend/            React/Vite explorer
├── docker-compose.yml   Local PostgreSQL service
└── .env.example         Development configuration template
```

## Local Setup

### Prerequisites

- Java 21
- Maven 3.9 or newer
- Node.js 20 or newer with npm
- Docker with Docker Compose

### 1. Configure the Environment

Copy the checked-in template and adjust values if the default ports or credentials conflict with your machine:

```bash
cp .env.example .env
```

Docker Compose reads the root `.env` automatically. Export the API variables into your shell before starting Spring Boot, or use the defaults shown in the template.

### 2. Start PostgreSQL

```bash
docker compose up -d
docker compose ps
```

The database is exposed at `localhost:55432` by default, avoiding conflicts with a system PostgreSQL installation. Its data lives in the named `repolens-postgres-data` volume, so normal container restarts preserve uploaded projects.

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`. Flyway creates and versions the schema at startup; Hibernate validates it rather than generating a production schema.

Run backend tests with:

```bash
cd backend
mvn test
```

### 4. Start the Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. During local development, Vite proxies `/api` to `http://localhost:8080`.

Run frontend checks with:

```bash
cd frontend
npm test
npm run build
```

### 5. Explore the Demo

Choose **Explore Demo** on the landing page. The client calls `POST /api/projects/demo`; the backend parses the bundled fixture through the same service used for uploads, persists it, and returns the resulting project. The canonical human-readable fixture is [demo/README.md](demo/README.md).

## Configuration

| Variable | Default | Used by | Purpose |
| --- | --- | --- | --- |
| `POSTGRES_DB` | `repolens` | Docker Compose | PostgreSQL database name |
| `POSTGRES_USER` | `repolens` | Docker Compose | PostgreSQL container user |
| `POSTGRES_PASSWORD` | `repolens` | Docker Compose | Local PostgreSQL password |
| `POSTGRES_PORT` | `55432` | Docker Compose | Host port mapped to PostgreSQL |
| `DB_URL` | `jdbc:postgresql://localhost:55432/repolens` | Backend | JDBC connection URL |
| `DB_USERNAME` | `repolens` | Backend | JDBC username |
| `DB_PASSWORD` | `repolens` | Backend | JDBC password |
| `SERVER_PORT` | `8080` | Backend | API port |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Backend | Comma-separated allowed browser origins |
| `MAX_FILE_SIZE` | `5MB` | Backend | Maximum accepted Markdown upload size |
| `MAX_UPLOAD_BYTES` | `5242880` | Backend | Service-level upload limit in bytes (keep aligned with `MAX_FILE_SIZE`) |
| `VITE_API_URL` | `/api` | Frontend | API base path or absolute API URL |

The values in `.env.example` are local-development defaults, not production credentials. Keep `POSTGRES_*` and the corresponding `DB_*` credentials aligned when changing them.

## API Endpoints

All project endpoints return JSON except the empty response from a successful delete. Upload and replacement requests use `multipart/form-data` with a field named `file`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/projects` | Validate, parse, persist, and return an uploaded README |
| `POST` | `/api/projects/demo` | Parse and persist the bundled demo through the normal project pipeline |
| `GET` | `/api/projects` | List saved project summaries |
| `GET` | `/api/projects/{id}` | Return a project with its normalized README tree |
| `PUT` | `/api/projects/{id}/readme` | Replace and reparse a project's Markdown file |
| `DELETE` | `/api/projects/{id}` | Delete a persisted project |

Example upload:

```bash
curl -F "file=@README.md;type=text/markdown" http://localhost:8080/api/projects
```

The API accepts `.md` and `.markdown` files, rejects empty or oversized uploads, and reports validation failures as structured error responses.

## Markdown Semantics

Every source heading becomes one node and retains its exact visible title. Duplicate titles receive distinct internal IDs but are never renamed. A heading attaches to the nearest earlier heading with a lower level, which also makes skipped levels safe. Multiple H1 headings stay as separate roots, and a README without an H1 uses its highest available headings as roots.

Content after a heading belongs to that heading until the next heading begins. Child content is not repeated in its parent. Heading-less documents remain readable, but RepoLens explains that no heading map can be generated.

## Screenshots

### Upload Screen

_Screenshot placeholder: landing page with the README dropzone and Explore Demo action._

<!-- Add docs/screenshots/upload.png when release screenshots are captured. -->

### Focus Mode

_Screenshot placeholder: radial navigation with the outline and selected-node content panel._

<!-- Add docs/screenshots/focus-mode.png when release screenshots are captured. -->

### Full Map

_Screenshot placeholder: the complete heading hierarchy with pan, zoom, and fit controls._

<!-- Add docs/screenshots/full-map.png when release screenshots are captured. -->

## Troubleshooting

### PostgreSQL Is Not Ready

Check the container health and logs:

```bash
docker compose ps
docker compose logs postgres
```

If port `55432` is already in use, change `POSTGRES_PORT` and update the port in `DB_URL` to match.

### The Browser Cannot Reach the API

Confirm the backend is listening on port `8080`. When running Vite locally, keep `VITE_API_URL=/api` so the development proxy is used. For separate deployments, set it to the backend's public API base URL and include the frontend origin in `CORS_ALLOWED_ORIGINS`.

## Future Improvements

- Add import from a repository URL while preserving the same deterministic parser rules.
- Add exportable map snapshots and shareable, read-only project links.
- Improve layout virtualization for exceptionally large heading trees.
- Add more keyboard traversal options and automated accessibility coverage.
- Add optional container images for the API and frontend alongside PostgreSQL.
- Add production observability dashboards using the existing Actuator health data.

## License

No license has been selected for this project yet.
