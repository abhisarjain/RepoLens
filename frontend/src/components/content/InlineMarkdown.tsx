import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InlineMarkdownProps {
  children: string;
  className?: string;
}

export function InlineMarkdown({ children, className = "" }: InlineMarkdownProps) {
  return (
    <div className={`markdown-inline ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: label }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-lens-300 underline decoration-lens-400/35 underline-offset-4 transition-colors hover:text-white"
            >
              {label}
            </a>
          ),
          code: ({ className: codeClass, children: codeChildren }) => (
            <code
              className={`${codeClass ?? ""} rounded-md border border-white/10 bg-white/[0.055] px-1.5 py-0.5 font-mono text-[0.86em] text-cyan-100`}
            >
              {codeChildren}
            </code>
          ),
          p: ({ children: paragraph }) => <>{paragraph}</>,
          img: ({ src, alt }) => (
            <span className="text-sm text-slate-400">[{alt || src || "image"}]</span>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function plainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(plainText).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(plainText).join(" ");
  }
  return "";
}

export function EmptyContentHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.018] px-4 py-5 text-sm leading-6 text-slate-500">
      {children}
    </div>
  );
}
