import { useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, getFieldType, shortId } from "@/lib/fieldTypes";

type ViewMode = "structured" | "json";

function arrayPreview(value: unknown): string {
  const t = getFieldType(value);
  if (t === "null") return "null";
  if (t === "object" && value && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value as object);
    return keys.length ? `${keys[0]}: …` : "{}";
  }
  if (t === "array") return `Array [${(value as unknown[]).length}]`;
  if (typeof value === "string") {
    const s = value as string;
    return s.length > 48 ? `${s.slice(0, 48)}…` : s;
  }
  return String(value);
}

function CopyTiny({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(text);
      }}
      className="rounded p-0.5 text-zinc-600 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover/kv:opacity-100"
      title="Copy value"
    >
      <Copy size={10} />
    </button>
  );
}

function LeafValue({ value }: { value: unknown }) {
  const t = getFieldType(value);
  if (t === "null") {
    return <span className="italic text-zinc-600">null</span>;
  }
  if (t === "boolean") {
    const b = value as boolean;
    return (
      <span
        className={cn(
          "inline-flex rounded px-1.5 py-px font-mono text-[11px]",
          b ? "bg-emerald-900/35 text-emerald-400" : "bg-zinc-800 text-zinc-500",
        )}
      >
        {String(b)}
      </span>
    );
  }
  if (t === "number") {
    return (
      <span className="font-mono text-[11px] text-sky-400 tabular-nums">
        {String(value)}
      </span>
    );
  }
  if (t === "date") {
    return (
      <span className="text-[11px] text-violet-400" title={value as string}>
        {formatDate(value as string)}
      </span>
    );
  }
  if (t === "objectid") {
    const id = value as string;
    return (
      <span className="group/id inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400">
        <span title={id}>{shortId(id)}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void navigator.clipboard.writeText(id);
          }}
          className="rounded p-0.5 text-zinc-600 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-zinc-300 group-hover/id:opacity-100"
          title="Copy ID"
        >
          <Copy size={10} />
        </button>
      </span>
    );
  }
  const s = String(value);
  return (
    <span className="break-all text-[11px] text-zinc-300" title={s}>
      {s}
    </span>
  );
}

function NestedValue({ value, depth }: { value: unknown; depth: number }) {
  const t = getFieldType(value);
  if (t === "object") {
    return (
      <StructuredObject
        obj={value as Record<string, unknown>}
        depth={depth}
      />
    );
  }
  if (t === "array") {
    return <StructuredArray arr={value as unknown[]} depth={depth} />;
  }
  return <LeafValue value={value} />;
}

/** Flat key/value — spacing + optional indent, no card. */
function StructuredObject({
  obj,
  depth,
}: {
  obj: Record<string, unknown>;
  depth: number;
}) {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return <span className="text-zinc-600">{`{}`}</span>;
  }
  return (
    <div
      className={cn(
        "space-y-3",
        depth > 0 && "border-l border-zinc-800/50 pl-4",
      )}
    >
      {keys.map((k) => (
        <div
          key={k}
          className="group/kv grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-[minmax(5rem,8rem)_minmax(0,1fr)] sm:items-start"
        >
          <div className="flex items-baseline gap-1">
            <span className="break-all font-mono text-[11px] font-medium leading-snug text-zinc-500">
              {k}
            </span>
            <CopyTiny
              text={
                typeof obj[k] === "object" && obj[k] !== null
                  ? JSON.stringify(obj[k])
                  : String(obj[k])
              }
            />
          </div>
          <div className="min-w-0 text-[11px] leading-relaxed text-zinc-300">
            <NestedValue value={obj[k]} depth={depth + 1} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Flat list: dividers + indent — no per-item cards. */
function StructuredArray({ arr, depth }: { arr: unknown[]; depth: number }) {
  if (arr.length === 0) {
    return <span className="text-zinc-600">[]</span>;
  }
  return (
    <div className="divide-y divide-zinc-800/50">
      {arr.map((item, i) => (
        <ArrayItemBlock key={i} index={i} value={item} depth={depth} />
      ))}
    </div>
  );
}

function ArrayItemBlock({
  index,
  value,
  depth,
}: {
  index: number;
  value: unknown;
  depth: number;
}) {
  const t = getFieldType(value);
  const complex = t === "object" || t === "array";
  const [open, setOpen] = useState(true);

  if (!complex) {
    return (
      <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
        <span
          className="w-7 shrink-0 pt-0.5 text-right font-mono text-[10px] font-semibold tabular-nums text-zinc-500"
          title={`Index ${index}`}
        >
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <LeafValue value={value} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 rounded-sm py-0.5 text-left text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <span className="mt-0.5 shrink-0">
          {open ?
            <ChevronDown size={12} className="text-zinc-600" />
          : <ChevronRight size={12} className="text-zinc-600" />}
        </span>
        <span className="w-7 shrink-0 text-right font-mono text-[10px] font-semibold tabular-nums text-zinc-500">
          {index}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-zinc-500">
          {arrayPreview(value)}
        </span>
      </button>
      {open && (
        <div className="mt-2 pl-9">
          <NestedValue value={value} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}

export function StructuredDocumentValue({ value }: { value: unknown }) {
  const [mode, setMode] = useState<ViewMode>("structured");
  const [open, setOpen] = useState(true);
  const isArr = Array.isArray(value);
  const label = isArr ?
      `${(value as unknown[]).length} items`
    : `${Object.keys((value as object) ?? {}).length} keys`;

  const json = JSON.stringify(value, null, 2);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200"
        >
          {open ?
            <ChevronDown size={12} />
          : <ChevronRight size={12} />}
          <span>{isArr ? "Array" : "Object"}</span>
          <span className="text-zinc-600">({label})</span>
        </button>
        <div className="inline-flex items-center gap-0.5 rounded-md bg-zinc-900/70 p-0.5 text-[10px]">
          <button
            type="button"
            onClick={() => setMode("structured")}
            className={cn(
              "rounded px-2 py-0.5 transition-colors",
              mode === "structured" ?
                "bg-zinc-700/90 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Structured
          </button>
          <button
            type="button"
            onClick={() => setMode("json")}
            className={cn(
              "rounded px-2 py-0.5 transition-colors",
              mode === "json" ?
                "bg-zinc-700/90 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            JSON
          </button>
        </div>
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(json)}
          className="rounded p-1 text-zinc-600 hover:bg-zinc-800/80 hover:text-zinc-300"
          title="Copy JSON"
        >
          <Copy size={12} />
        </button>
      </div>
      {open && (
        <div className="mt-3">
          {mode === "structured" ?
            isArr ?
              <StructuredArray arr={value as unknown[]} depth={0} />
            : <StructuredObject obj={value as Record<string, unknown>} depth={0} />
          : <pre className="max-h-64 overflow-auto rounded-md border border-zinc-800/80 bg-zinc-950/50 p-3 font-mono text-[11px] leading-relaxed text-zinc-400">
              {json}
            </pre>
          }
        </div>
      )}
    </div>
  );
}
