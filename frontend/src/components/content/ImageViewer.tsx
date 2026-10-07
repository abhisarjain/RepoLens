import { ImageOff, Maximize2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { ReadmeContent } from "../../types/readme";

export function ImageViewer({ block }: { block: ReadmeContent }) {
  const src = block.url ?? block.src ?? "";
  const alt = block.alt ?? block.title ?? "README image";
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex min-h-28 items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.018] px-4 text-sm text-slate-500">
        <ImageOff size={17} />
        {src ? `Could not load ${alt}` : "Image URL is missing"}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lens-400"
      >
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="max-h-[420px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          loading="lazy"
        />
        <span className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/65 px-2 py-1 text-[10px] text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Maximize2 size={12} /> Preview
        </span>
        {block.title || block.alt ? (
          <span className="block border-t border-white/[0.06] px-3 py-2 text-xs text-slate-500">
            {block.title ?? block.alt}
          </span>
        ) : null}
      </button>
      {createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label={alt}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-lg border border-white/10 bg-black/50 p-2 text-slate-300 hover:text-white"
                aria-label="Close image preview"
              >
                <X size={20} />
              </button>
              <motion.img
                src={src}
                alt={alt}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-h-[90vh] max-w-[94vw] rounded-lg object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
