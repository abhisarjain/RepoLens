import type { ApiErrorBody, Project, ProjectSummary } from "../types/project";
import { normalizeDocument } from "../utils/readmeTree";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export class ProjectApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = "ProjectApiError";
    this.status = status;
    this.body = body;
  }
}

function errorMessage(body: ApiErrorBody | null, fallback: string): string {
  if (!body) return fallback;
  if (body.message) return body.message;
  if (body.detail) return body.detail;
  if (body.error) return body.error;
  if (body.fieldErrors) return Object.values(body.fieldErrors).join(" · ");
  if (body.errors?.length) {
    return body.errors
      .map((error) => error.message ?? error.defaultMessage)
      .filter(Boolean)
      .join(" · ");
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new ProjectApiError(
      "Could not reach the RepoLens API. Check that the backend is running.",
      0,
      null,
    );
  }

  if (response.status === 204) return undefined as T;
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson
    ? ((await response.json()) as unknown)
    : await response.text();
  if (!response.ok) {
    const body =
      payload && typeof payload === "object" ? (payload as ApiErrorBody) : null;
    throw new ProjectApiError(
      errorMessage(
        body,
        typeof payload === "string" && payload
          ? payload
          : `Request failed (${response.status})`,
      ),
      response.status,
      body,
    );
  }
  return payload as T;
}

function normalizeProject(payload: unknown): Project {
  const record = (payload && typeof payload === "object" ? payload : {}) as Record<
    string,
    unknown
  >;
  const fileName = String(record.fileName ?? record.filename ?? "README.md");
  const documentValue =
    record.document ?? record.parsedTree ?? record.parsed_tree ?? {
      fileName,
      roots: record.roots,
      content: record.content,
    };
  const document = normalizeDocument(documentValue, fileName);
  return {
    id: Number(record.id),
    name: String(record.name ?? document.roots[0]?.title ?? fileName),
    fileName,
    createdAt: String(record.createdAt ?? record.created_at ?? ""),
    updatedAt: record.updatedAt
      ? String(record.updatedAt)
      : record.updated_at
        ? String(record.updated_at)
        : undefined,
    rawMarkdown:
      typeof record.rawMarkdown === "string"
        ? record.rawMarkdown
        : typeof record.raw_markdown === "string"
          ? record.raw_markdown
          : undefined,
    document,
  };
}

function upload(file: File, path: string, method = "POST"): Promise<Project> {
  const form = new FormData();
  form.append("file", file);
  return request<unknown>(path, { method, body: form }).then(normalizeProject);
}

export const projectApi = {
  createProject(file: File): Promise<Project> {
    return upload(file, "/projects");
  },

  async getProjects(): Promise<ProjectSummary[]> {
    return request<ProjectSummary[]>("/projects");
  },

  async getProject(id: number | string): Promise<Project> {
    const payload = await request<unknown>(`/projects/${encodeURIComponent(id)}`);
    return normalizeProject(payload);
  },

  updateProjectReadme(id: number | string, file: File): Promise<Project> {
    return upload(file, `/projects/${encodeURIComponent(id)}/readme`, "PUT");
  },

  deleteProject(id: number | string): Promise<void> {
    return request<void>(`/projects/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async createDemoProject(): Promise<Project> {
    const payload = await request<unknown>("/projects/demo", { method: "POST" });
    return normalizeProject(payload);
  },
};
