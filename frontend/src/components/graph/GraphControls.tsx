import { LocateFixed, Minus, Plus } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

export function GraphControls() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const buttons = [
    { label: "Zoom in", icon: Plus, action: () => zoomIn({ duration: 180 }) },
    { label: "Zoom out", icon: Minus, action: () => zoomOut({ duration: 180 }) },
    {
      label: "Fit view",
      icon: LocateFixed,
      action: () => fitView({ padding: 0.2, duration: 320, maxZoom: 1 }),
    },
  ];
  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center overflow-hidden rounded-xl border border-white/10 bg-ink-900/90 shadow-xl backdrop-blur">
      {buttons.map(({ label, icon: Icon, action }) => (
        <button
          key={label}
          type="button"
          onClick={action}
          className="grid h-9 w-9 place-items-center border-r border-white/[0.07] text-slate-400 transition-colors last:border-0 hover:bg-white/[0.055] hover:text-white focus:outline-none focus-visible:bg-white/[0.08]"
          title={label}
          aria-label={label}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
