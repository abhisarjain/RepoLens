import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion, useReducedMotion } from "framer-motion";
import { CornerDownLeft, GitBranch } from "lucide-react";
import type { ReadmeFlowNode } from "../../utils/graphLayout";

export function ReadmeGraphNode({ data }: NodeProps<ReadmeFlowNode>) {
  const reducedMotion = useReducedMotion();
  const isCurrent = data.role === "current";
  const isParent = data.role === "parent";
  const selected = data.selected || isCurrent;
  const activate = data.onActivate as (() => void) | undefined;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: isParent ? 0.66 : 1, scale: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.94 }}
      transition={{ duration: reducedMotion ? 0 : 0.26, ease: "easeOut" }}
      className={`readme-node group relative flex min-h-[82px] w-[214px] cursor-grab flex-col justify-center overflow-hidden rounded-[24px] border px-5 py-4 text-left shadow-node transition-[border-color,background-color,box-shadow] active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-lens-300 ${
        isCurrent
          ? "readme-node--current min-h-[104px] w-[228px] border-lens-400/55 bg-[#132631] shadow-[0_24px_75px_rgba(8,181,228,.16),inset_0_1px_0_rgba(255,255,255,.08)]"
          : selected
            ? "border-lens-400/40 bg-[#14212b]"
            : isParent
              ? "border-amber-300/45 bg-[#2a2116]/95 shadow-[0_18px_55px_rgba(245,158,11,.10)] hover:border-amber-300/65 hover:bg-[#302619] hover:opacity-100"
              : "border-white/[0.11] bg-[#121721]/95 hover:border-lens-400/35 hover:bg-[#151d28]"
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${data.label}, heading level ${data.level}${data.childCount ? `, ${data.childCount} branches` : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        activate?.();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate?.();
        }
      }}
    >
      <Handle type="target" position={Position.Top} className="!h-0 !w-0 !border-0 !bg-transparent" />
      {isCurrent ? (
        <span className="absolute inset-0 rounded-[24px] border border-lens-300/10" aria-hidden="true" />
      ) : null}
      <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
        <span>H{data.level}</span>
        {isParent ? (
          <span className="flex items-center gap-1 text-amber-300/80"><CornerDownLeft size={10} /> Parent</span>
        ) : data.childCount ? (
          <span className="flex items-center gap-1 text-lens-300/65">
            <GitBranch size={10} /> {data.childCount}
          </span>
        ) : (
          <span>Leaf</span>
        )}
      </div>
      <div className={`${isCurrent ? "text-[16px]" : "text-[14px]"} ${isParent ? "text-amber-50" : "text-slate-100"} line-clamp-3 break-words font-medium leading-snug tracking-[-0.01em]`}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !border-0 !bg-transparent" />
    </motion.div>
  );
}
