import type { ReadmeContent } from "../../types/readme";
import { InlineMarkdown } from "./InlineMarkdown";

export function TableRenderer({ block }: { block: ReadmeContent }) {
  const headers = block.headers ?? [];
  const rows = block.rows ?? [];
  if (!headers.length && !rows.length) {
    const source = block.rawMarkdown ?? block.text ?? "";
    return source ? (
      <div className="readme-table-markdown overflow-x-auto rounded-xl border border-white/10 p-3 text-sm text-slate-300">
        <InlineMarkdown>{source}</InlineMarkdown>
      </div>
    ) : null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.018]">
      <table className="w-full min-w-[360px] border-collapse text-left text-[13px]">
        {headers.length ? (
          <thead className="bg-white/[0.035] text-[10px] uppercase tracking-[0.12em] text-slate-500">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="border-b border-white/[0.08] px-3 py-2.5 font-medium">
                  <InlineMarkdown>{header}</InlineMarkdown>
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-white/[0.055] last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2.5 align-top text-slate-300">
                  <InlineMarkdown>{cell}</InlineMarkdown>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
