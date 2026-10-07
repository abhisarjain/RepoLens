import { motion, AnimatePresence } from "framer-motion";
import { AlignLeft, GitBranch, X } from "lucide-react";
import type { ReadmeContent, ReadmeNode } from "../../types/readme";
import { ContentBlockRenderer } from "../content/ContentBlockRenderer";
import { EmptyContentHint } from "../content/InlineMarkdown";

interface ContentPanelProps {
  node: ReadmeNode | null;
  documentContent: ReadmeContent[];
  fileName: string;
  onClose?: () => void;
}

export function ContentPanel({ node, documentContent, fileName, onClose }: ContentPanelProps) {
  const content = node?.content ?? documentContent;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center border-b border-white/[0.07] px-4">
        <AlignLeft size={13} className="mr-2 text-slate-600" />
        <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
          Selected node content
        </span>
        {onClose ? (
          <button type="button" onClick={onClose} className="mobile-panel-close" aria-label="Close content panel">
            <X size={16} />
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={node?.id ?? "document-content"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18 }}
            className="px-4 pb-10 pt-5"
          >
            <div className="mb-6 border-b border-white/[0.07] pb-5">
              <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
                {node ? <span>Heading · H{node.level}</span> : <span>{fileName} · document content</span>}
                {node?.children.length ? (
                  <span className="flex items-center gap-1 text-slate-600">
                    <GitBranch size={10} /> {node.children.length} branch{node.children.length === 1 ? "" : "es"}
                  </span>
                ) : null}
              </div>
              {node ? (
                <h1 className="break-words text-xl font-semibold leading-7 tracking-[-0.025em] text-slate-100">
                  {node.title}
                </h1>
              ) : (
                <div className="text-sm leading-6 text-slate-400">
                  This README has no headings, so RepoLens cannot generate a heading map.
                </div>
              )}
            </div>
            {content.length ? (
              <div className="space-y-5">
                {content.map((block, index) => (
                  <ContentBlockRenderer
                    key={`${node?.id ?? "document"}-${index}-${block.type}`}
                    block={block}
                  />
                ))}
              </div>
            ) : (
              <EmptyContentHint>
                {node
                  ? "This heading has no content of its own. Its child headings remain separate nodes in the map."
                  : "The document contains no readable content blocks."}
              </EmptyContentHint>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
