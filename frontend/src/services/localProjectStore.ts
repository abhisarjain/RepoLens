import type { Project, ProjectSummary } from "../types/project";
import { parseMarkdown } from "../utils/parseMarkdown";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const projects = new Map<number, Project>();
let sequence = 0;

function validateFile(file: File): void {
  const lowerName = file.name.toLocaleLowerCase();
  if (!lowerName.endsWith(".md") && !lowerName.endsWith(".markdown")) {
    throw new Error("Choose a .md or .markdown file.");
  }
  if (file.size > MAX_FILE_SIZE) throw new Error("README files must be 5 MB or smaller.");
  if (file.size === 0) throw new Error("That README file is empty.");
}

function nameFrom(fileName: string, markdown: string, firstHeading?: string): string {
  if (firstHeading?.trim()) return firstHeading.trim();
  const firstText = markdown.split(/\r?\n/).find((line) => line.trim())?.trim();
  return firstText?.slice(0, 80) || fileName.replace(/\.(md|markdown)$/i, "") || "README";
}

function create(fileName: string, markdown: string): Project {
  const document = parseMarkdown(markdown, fileName);
  const now = new Date().toISOString();
  const id = Date.now() * 100 + sequence++;
  const project: Project = {
    id,
    name: nameFrom(fileName, markdown, document.roots[0]?.title),
    fileName,
    createdAt: now,
    updatedAt: now,
    rawMarkdown: markdown,
    document,
  };
  projects.set(id, project);
  return project;
}

function summary(project: Project): ProjectSummary {
  const { id, name, fileName, createdAt, updatedAt } = project;
  return { id, name, fileName, createdAt, updatedAt };
}

export const localProjectStore = {
  async createProject(file: File): Promise<Project> {
    validateFile(file);
    return create(file.name, await file.text());
  },
  createProjectFromMarkdown(fileName: string, markdown: string): Project {
    return create(fileName, markdown);
  },
  getProjects(): ProjectSummary[] {
    return [...projects.values()].reverse().map(summary);
  },
  getProject(id: number | string): Project | null {
    return projects.get(Number(id)) ?? null;
  },
  async updateProjectReadme(id: number | string, file: File): Promise<Project> {
    validateFile(file);
    const existing = projects.get(Number(id));
    if (!existing) throw new Error("This map was cleared. Upload the README again.");
    const markdown = await file.text();
    const document = parseMarkdown(markdown, file.name);
    const updated: Project = {
      ...existing,
      name: nameFrom(file.name, markdown, document.roots[0]?.title),
      fileName: file.name,
      rawMarkdown: markdown,
      document,
      updatedAt: new Date().toISOString(),
    };
    projects.set(existing.id, updated);
    return updated;
  },
};
