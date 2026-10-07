import type { ReadmeDocument } from "./readme";

export interface ProjectSummary {
  id: number;
  name: string;
  fileName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project extends ProjectSummary {
  rawMarkdown?: string;
  document: ReadmeDocument;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  detail?: string;
  fieldErrors?: Record<string, string>;
  errors?: Array<{ field?: string; message?: string; defaultMessage?: string }>;
}
