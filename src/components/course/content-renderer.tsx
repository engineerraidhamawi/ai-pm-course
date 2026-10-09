"use client";

import { useState } from "react";
import type { ContentBlock } from "@/lib/course-data";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
      className={cn(
        "rounded-md border border-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition",
        done
          ? "bg-emerald-500 text-white border-emerald-500"
          : "bg-white/10 text-slate-200 hover:bg-indigo-500 hover:text-white hover:border-indigo-500",
      )}
    >
      {done ? "Copied!" : "Copy"}
    </button>
  );
}

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h4 key={i} className="mt-6 text-xs font-bold uppercase tracking-wider text-indigo-600">
                {block.text}
              </h4>
            );
          case "paragraph":
            return (
              <p key={i} className="text-[15px] leading-relaxed text-slate-700">
                {block.text}
              </p>
            );
          case "list":
            return block.ordered ? (
              <ol key={i} className="ml-5 list-decimal space-y-1 text-[15px] text-slate-700">
                {block.items.map((it, j) => <li key={j}>{it}</li>)}
              </ol>
            ) : (
              <ul key={i} className="ml-5 list-disc space-y-1 text-[15px] text-slate-700">
                {block.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            );
          case "prompt":
            return (
              <div key={i} className="overflow-hidden rounded-lg border border-slate-700 bg-[#161d2e]">
                <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 bg-[#1d2639] px-3.5 py-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {block.title}
                  </span>
                  <CopyButton text={block.code} />
                </div>
                <pre className="overflow-x-auto px-4 py-3.5 text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap">
                  {block.code}
                </pre>
              </div>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full border-collapse bg-white text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {block.headers.map((h, j) => (
                        <th key={j} className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        {row.map((cell, k) => (
                          <td key={k} className={cn("px-3.5 py-2.5 align-top text-slate-700", k === 0 && "font-semibold text-slate-900")}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}