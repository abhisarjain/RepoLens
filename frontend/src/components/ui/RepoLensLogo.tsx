import { ScanSearch } from "lucide-react";
import { Link } from "react-router-dom";

export function RepoLensLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-lens-400"
      aria-label="RepoLens home"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-[10px] border border-lens-400/30 bg-lens-400/[0.09] text-lens-300 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
        <ScanSearch size={17} strokeWidth={1.8} />
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-lens-300 shadow-[0_0_9px_rgba(94,210,245,.7)]" />
      </span>
      {!compact ? (
        <span className="text-[15px] font-semibold tracking-[-0.025em] text-slate-100 transition-colors group-hover:text-white">
          Repo<span className="text-lens-300">Lens</span>
        </span>
      ) : null}
    </Link>
  );
}
