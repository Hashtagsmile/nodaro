import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDate,
  getFieldType,
  isObjectId,
  shortId,
} from "@/lib/fieldTypes";
import { StructuredDocumentValue } from "./StructuredDocumentValue";

export type FieldContext = "table" | "panel";

interface FieldValueProps {
  value: unknown;
  context?: FieldContext;
}

export function FieldValue({ value, context = "table" }: FieldValueProps) {
  const type = getFieldType(value);

  if (type === "null") {
    return <span className="text-zinc-700 text-xs italic">null</span>;
  }

  if (type === "boolean") {
    const bool = value as boolean;
    const content = (
      <span
        className={cn(
          "inline-flex items-center rounded px-1.5 py-px font-mono text-xs",
          bool ?
            "bg-emerald-900/30 text-emerald-400"
          : "bg-zinc-800 text-zinc-500",
        )}
      >
        {String(bool)}
      </span>
    );
    if (context === "panel") {
      return (
        <span className="group inline-flex items-center gap-1.5">
          {content}
          <CopyButton
            value={String(bool)}
            label="Copy value"
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        </span>
      );
    }
    return content;
  }

  if (type === "number") {
    const raw = String(value);
    if (context === "panel") {
      return (
        <span className="group inline-flex items-center gap-1.5">
          <span className="font-mono text-xs text-sky-400 tabular-nums">{raw}</span>
          <CopyButton
            value={raw}
            label="Copy value"
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        </span>
      );
    }
    return <span className="font-mono text-xs text-sky-400 tabular-nums">{raw}</span>;
  }

  if (type === "date") {
    const iso = value as string;
    if (context === "panel") {
      return (
        <span className="group inline-flex items-center gap-1.5">
          <span className="text-xs text-violet-400" title={iso}>
            {formatDate(iso)}
          </span>
          <CopyButton
            value={iso}
            label="Copy ISO date"
            className="opacity-0 transition-opacity group-hover:opacity-100"
          />
        </span>
      );
    }
    return (
      <span className="text-xs text-violet-400" title={iso}>
        {formatDate(iso)}
      </span>
    );
  }

  if (type === "objectid") {
    const id = value as string;
    return (
      <span
        className={cn(
          "group/oid inline-flex items-center gap-1.5",
          context === "table" && "cursor-help",
        )}
        title={id}
      >
        <span
          className={cn(
            "font-mono text-xs text-zinc-500",
            context === "table" &&
              "underline-offset-2 transition-colors hover:text-emerald-400/90 hover:underline hover:decoration-emerald-500/50",
          )}
        >
          {context === "table" ? shortId(id) : id}
        </span>
        <CopyButton
          value={id}
          label="Copy ID"
          className={
            context === "panel" ?
              "opacity-0 transition-opacity group-hover/oid:opacity-100"
            : undefined
          }
        />
      </span>
    );
  }

  if (type === "array" || type === "object") {
    if (context === "table") {
      return <TableExpandableJSON value={value} />;
    }
    return <StructuredDocumentValue value={value} />;
  }

  // String
  const str = String(value);
  if (context === "table") {
    return (
      <span className="text-xs text-zinc-300" title={str}>
        {str.length > 100 ? str.slice(0, 100) + "…" : str}
      </span>
    );
  }
  if (context === "panel") {
    return (
      <span className="group inline-flex items-center gap-1.5">
        <span className="break-all text-sm text-zinc-300">{str}</span>
        <CopyButton
          value={str}
          label="Copy value"
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </span>
    );
  }
  return <span className="break-all text-sm text-zinc-300">{str}</span>;
}

/** Inline expand for table cells; stops row selection when interacting. */
function TableExpandableJSON({ value }: { value: unknown }) {
  const [open, setOpen] = useState(false);
  const isArr = Array.isArray(value);
  const label =
    isArr ?
      `Array [${(value as unknown[]).length}]`
    : `Object {${Object.keys(value as object).length}}`;

  return (
    <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex max-w-full items-center gap-1 rounded px-1 py-0.5 font-mono text-xs text-zinc-500 transition-colors hover:bg-zinc-800/80 hover:text-emerald-400/90"
        title={open ? "Collapse" : "Expand inline"}
      >
        {open ?
          <ChevronDown size={11} className="shrink-0 text-zinc-500" />
        : <ChevronRight size={11} className="shrink-0 text-zinc-500" />}
        <span className="truncate">{label}</span>
      </button>
      {open && (
        <pre
          className="mt-1 max-h-36 overflow-auto rounded border border-zinc-800/80 bg-zinc-900/90 p-2 font-mono text-[10px] leading-relaxed text-zinc-400 shadow-inner"
          onClick={(e) => e.stopPropagation()}
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}

function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 900);
    return () => clearTimeout(id);
  }, [copied]);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // clipboard can fail in insecure contexts; ignore silently
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => void handleCopy(e)}
      className={cn(
        "rounded p-0.5 text-zinc-700 transition-colors hover:bg-zinc-800 hover:text-zinc-300",
        className,
      )}
      title={copied ? "Copied" : label}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
    </button>
  );
}

/** Determine the right <input> type for inline editing */
export function getInputType(value: unknown): string {
  const type = getFieldType(value);
  if (type === "number") return "number";
  if (type === "boolean") return "checkbox";
  if (type === "date") return "datetime-local";
  return "text";
}

/** Parse a raw input string back to the appropriate type */
export function parseInputValue(raw: string, originalValue: unknown): unknown {
  const type = getFieldType(originalValue);
  if (type === "number") {
    const n = Number(raw);
    return isNaN(n) ? raw : n;
  }
  if (type === "boolean") return raw === "true";
  if (type === "objectid") return isObjectId(raw) ? raw : raw;
  return raw;
}
