import { FileCode2, FolderOpen, LoaderCircle, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState, type DragEvent } from "react";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

interface ReadmeDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  busy?: boolean;
}

function validate(file: File): string | null {
  const lower = file.name.toLocaleLowerCase();
  if (!lower.endsWith(".md") && !lower.endsWith(".markdown")) {
    return "Choose a Markdown file ending in .md or .markdown.";
  }
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_FILE_BYTES) return "That file is larger than the 5 MB upload limit.";
  return null;
}

export function ReadmeDropzone({ onUpload, busy = false }: ReadmeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handle = async (file: File) => {
    const validation = validate(file);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setFileName(file.name);
    try {
      await onUpload(file);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Try again.");
      setFileName(null);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (busy) return;
    const file = event.dataTransfer.files[0];
    if (file) void handle(file);
  };

  return (
    <div>
      <motion.div
        animate={{ scale: dragging ? 1.008 : 1 }}
        transition={{ duration: 0.16 }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={onDrop}
        className={`relative overflow-hidden rounded-2xl border p-1 transition-colors ${
          dragging
            ? "border-lens-400/65 bg-lens-400/[0.06]"
            : error
              ? "border-rose-400/30 bg-rose-400/[0.025]"
              : "border-white/[0.11] bg-white/[0.025] hover:border-white/[0.18]"
        }`}
      >
        <div className="relative flex min-h-[232px] flex-col items-center justify-center overflow-hidden rounded-[13px] border border-dashed border-white/[0.09] px-6 py-8 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,200,240,.065),transparent_55%)]" />
          <input
            ref={inputRef}
            type="file"
            accept=".md,.markdown,text/markdown,text/plain"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handle(file);
              event.currentTarget.value = "";
            }}
          />
          <span className={`relative mb-4 grid h-12 w-12 place-items-center rounded-2xl border ${busy ? "border-lens-400/25 bg-lens-400/[0.07] text-lens-300" : "border-white/10 bg-black/25 text-slate-400"}`}>
            {busy ? <LoaderCircle size={21} className="animate-spin" /> : dragging ? <UploadCloud size={21} /> : <FileCode2 size={21} />}
          </span>
          <h2 className="relative text-[16px] font-medium tracking-[-0.01em] text-slate-100">
            {busy ? `Mapping ${fileName ?? "README"}…` : dragging ? "Release to explore" : "Drop README.md here"}
          </h2>
          <p className="relative mt-2 max-w-xs text-xs leading-5 text-slate-500">
            RepoLens preserves the file’s existing heading hierarchy exactly as written.
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="relative mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.045] px-4 text-xs font-medium text-slate-200 transition-colors hover:border-lens-400/35 hover:bg-lens-400/[0.07] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lens-400 disabled:pointer-events-none disabled:opacity-50"
          >
            <FolderOpen size={14} /> Choose file
          </button>
          <div className="relative mt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-700">
            .md · .markdown · up to 5 MB
          </div>
        </div>
      </motion.div>
      {error ? (
        <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.05] px-3 py-2.5 text-xs leading-5 text-rose-200/80" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
