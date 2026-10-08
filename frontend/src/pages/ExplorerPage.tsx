import { AlertTriangle, ArrowLeft, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Explorer } from "../components/explorer/Explorer";
import { RepoLensLogo } from "../components/ui/RepoLensLogo";
import { localProjectStore } from "../services/localProjectStore";
import type { Project } from "../types/project";

export function ExplorerPage() {
  const { id = "" } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!/^\d+$/.test(id)) {
      setError("That project link is not valid.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const storedProject = localProjectStore.getProject(id);
    setProject(storedProject);
    setError(storedProject ? null : "This map lived only in browser memory and was cleared by a refresh. Upload the README again.");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const replace = async (file: File) => {
    const lowerName = file.name.toLocaleLowerCase();
    if (!lowerName.endsWith(".md") && !lowerName.endsWith(".markdown")) {
      setNotice("Choose a .md or .markdown file.");
      return;
    }
    setReplacing(true);
    setNotice(null);
    try {
      setProject(await localProjectStore.updateProjectReadme(id, file));
      setNotice("README replaced and map rebuilt.");
      window.setTimeout(() => setNotice(null), 2600);
    } catch (replaceError) {
      setNotice(replaceError instanceof Error ? replaceError.message : "Could not replace the README.");
    } finally {
      setReplacing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-ink-950 text-slate-300">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.025] text-lens-400">
            <LoaderCircle size={20} className="animate-spin" />
          </span>
          <div className="mt-4 text-sm">Loading node world…</div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-700">Project {id}</div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[100dvh] bg-ink-950 px-5 text-slate-100">
        <div className="mx-auto flex h-16 max-w-5xl items-center"><RepoLensLogo /></div>
        <div className="mx-auto mt-[14vh] max-w-md rounded-2xl border border-white/[0.09] bg-white/[0.025] p-6 text-center">
          <AlertTriangle className="mx-auto text-amber-300/70" size={25} />
          <h1 className="mt-4 text-lg font-medium">Couldn’t open this map</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/" className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-slate-300 hover:bg-white/[0.04]">
              <ArrowLeft size={13} /> Home
            </Link>
            <button type="button" onClick={load} className="inline-flex h-9 items-center gap-2 rounded-lg border border-lens-400/25 bg-lens-400/[0.07] px-3 text-xs text-lens-300 hover:bg-lens-400/[0.11]">
              <RefreshCw size={13} /> Check session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Explorer project={project} onReplace={replace} replacing={replacing} />
      {notice ? (
        <div className="fixed bottom-4 left-1/2 z-[110] -translate-x-1/2 rounded-lg border border-white/10 bg-[#171c26]/95 px-4 py-2.5 text-xs text-slate-200 shadow-2xl backdrop-blur" role="status">
          {notice}
        </div>
      ) : null}
    </div>
  );
}
