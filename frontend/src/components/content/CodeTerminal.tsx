import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ReadmeContent } from "../../types/readme";

function codeValue(block: ReadmeContent): string {
  const value = block.text ?? block.code ?? block.content ?? block.rawMarkdown ?? "";
  if (block.text || block.code || block.content) return value;
  return value
    .replace(/^```[^\n]*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .replace(/^ {4}/gm, "");
}

export function CodeTerminal({ block }: { block: ReadmeContent }) {
  const code = useMemo(() => codeValue(block), [block]);
  const language = block.language ?? block.lang ?? "text";
  const lines = code.split("\n").length;
  const isLong = lines > 18;
  const [expanded, setExpanded] = useState(!isLong);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#090c12] shadow-[0_14px_38px_rgba(0,0,0,.23)]">
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.07] bg-white/[0.025] px-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-rose-400/65" />
          <span className="h-2 w-2 rounded-full bg-amber-300/65" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
        </div>
        <span className="ml-2 min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-lens-400"
          aria-label="Copy code"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className={expanded ? "" : "max-h-[330px] overflow-hidden"}>
        <SyntaxHighlighter
          language={language === "text" ? undefined : language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem 1.1rem",
            background: "transparent",
            fontSize: "12px",
            lineHeight: "1.7",
          }}
          codeTagProps={{ style: { fontFamily: "inherit" } }}
          showLineNumbers={lines > 5}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] py-2 text-[11px] font-medium text-slate-400 transition-colors hover:bg-white/[0.035] hover:text-white"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Collapse" : `Show all ${lines} lines`}
        </button>
      ) : null}
    </div>
  );
}
