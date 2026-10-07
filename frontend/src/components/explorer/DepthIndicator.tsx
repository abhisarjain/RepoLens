interface DepthIndicatorProps {
  depth: number;
  maxVisible?: number;
}

export function DepthIndicator({ depth, maxVisible = 5 }: DepthIndicatorProps) {
  const count = Math.min(Math.max(depth + 1, 1), maxVisible);
  return (
    <div className="flex items-center gap-2" title={`Depth ${depth}`}>
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
        Depth {depth}
      </span>
      <span className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: maxVisible }, (_, index) => (
          <span
            key={index}
            className={`h-1 rounded-full transition-all ${
              index < count
                ? index === count - 1
                  ? "w-3 bg-lens-400"
                  : "w-1 bg-lens-400/45"
                : "w-1 bg-white/10"
            }`}
          />
        ))}
      </span>
    </div>
  );
}
