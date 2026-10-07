import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3, GitBranch, LoaderCircle, Sparkles, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ReadmeDropzone } from "../components/upload/ReadmeDropzone";
import { RepoLensLogo } from "../components/ui/RepoLensLogo";
import { projectApi } from "../services/projectApi";
import type { ProjectSummary } from "../types/project";

function MapMotif() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative mx-auto h-[310px] w-full max-w-[520px]" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
      <div className="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lens-400/[0.07]" />
      <svg className="absolute inset-0 h-full w-full text-white/[0.09]" viewBox="0 0 520 310">
        <path d="M260 155 L118 83 M260 155 L405 83 M260 155 L103 232 M260 155 L417 229" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
      </svg>
      <motion.div
        className="absolute left-1/2 top-1/2 grid h-[108px] w-[108px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[34px] border border-lens-400/40 bg-[#122632] shadow-[0_20px_70px_rgba(33,184,230,.16)]"
        animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-center">
          <GitBranch className="mx-auto mb-2 text-lens-300" size={20} />
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">Heading</div>
        </div>
      </motion.div>
      {[
        ["left-[11%] top-[17%]", "H2", 0.1],
        ["right-[9%] top-[18%]", "H2", 0.2],
        ["left-[8%] bottom-[14%]", "H3", 0.3],
        ["right-[6%] bottom-[14%]", "H3", 0.4],
      ].map(([position, label, delay]) => (
        <motion.div
          key={position as string}
          className={`absolute ${position} grid h-[74px] w-[110px] place-items-center rounded-[24px] border border-white/[0.09] bg-[#111620]/90 shadow-xl`}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay as number, duration: 0.5 }}
        >
          <span className="font-mono text-[10px] tracking-[0.15em] text-slate-500">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [recent, setRecent] = useState<ProjectSummary[]>([]);

  useEffect(() => {
    let active = true;
    projectApi
      .getProjects()
      .then((projects) => {
        if (active) setRecent(projects.slice(0, 4));
      })
      .catch(() => {
        // A stopped local backend should not obscure the primary upload action.
      });
    return () => {
      active = false;
    };
  }, []);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const project = await projectApi.createProject(file);
      navigate(`/project/${project.id}`);
    } finally {
      setUploading(false);
    }
  };

  const exploreDemo = async () => {
    setDemoLoading(true);
    setDemoError(null);
    try {
      const project = await projectApi.createDemoProject();
      navigate(`/project/${project.id}`);
    } catch (error) {
      setDemoError(error instanceof Error ? error.message : "Could not create the demo project.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-ink-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-grid-dots opacity-60" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-20%,rgba(39,167,206,.10),transparent_66%)]" />

      <header className="relative z-10 mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 lg:px-8">
        <RepoLensLogo />
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
          Structural, not semantic
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-[1180px] px-5 pb-16 pt-8 lg:px-8 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr] lg:gap-14">
          <section>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">
              <TerminalSquare size={12} className="text-lens-400" /> README spatial explorer
            </div>
            <h1 className="max-w-[650px] text-[42px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[54px] lg:text-[62px]">
              Your README is already a map.
              <span className="block text-slate-500">Step inside it.</span>
            </h1>
            <p className="mt-6 max-w-[590px] text-[15px] leading-7 text-slate-400 sm:text-base">
              RepoLens transforms the heading hierarchy you wrote into a navigable node world. No summaries, no categories, no invented relationships.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Exact heading text", "Deterministic search", "No AI"].map((item) => (
                <span key={item} className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-slate-500">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 hidden lg:block">
              <MapMotif />
            </div>
          </section>

          <section className="lg:pb-5">
            <div className="mb-3 flex items-end justify-between px-1">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.17em] text-lens-400/75">Start exploring</div>
                <div className="mt-1 text-sm text-slate-400">One file. Its structure, untouched.</div>
              </div>
            </div>
            <ReadmeDropzone onUpload={upload} busy={uploading} />
            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/[0.07]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-700">or</span>
              <span className="h-px flex-1 bg-white/[0.07]" />
            </div>
            <button
              type="button"
              onClick={exploreDemo}
              disabled={demoLoading || uploading}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-lens-400/25 bg-lens-400/[0.07] text-[13px] font-medium text-lens-300 transition-colors hover:border-lens-400/45 hover:bg-lens-400/[0.11] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lens-400 disabled:pointer-events-none disabled:opacity-50"
            >
              {demoLoading ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {demoLoading ? "Building demo map…" : "Explore demo"}
              {!demoLoading ? <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /> : null}
            </button>
            {demoError ? (
              <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.05] px-3 py-2.5 text-xs leading-5 text-rose-200/80" role="alert">
                {demoError}
              </div>
            ) : null}

            {recent.length ? (
              <div className="mt-8 border-t border-white/[0.07] pt-5">
                <div className="mb-2.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
                  <Clock3 size={11} /> Recent maps
                </div>
                <div className="space-y-1">
                  {recent.map((project) => (
                    <Link
                      key={project.id}
                      to={`/project/${project.id}`}
                      className="group flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.035]"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-slate-600 group-hover:text-lens-400">
                        <GitBranch size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs text-slate-300">{project.name}</span>
                        <span className="block truncate font-mono text-[9px] text-slate-700">{project.fileName}</span>
                      </span>
                      <ArrowRight size={12} className="text-slate-700 group-hover:text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
