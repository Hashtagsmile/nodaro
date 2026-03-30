import { useState } from "react";
import { Check, Wand2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createDocument } from "@/services/api";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";

interface CreateDocumentModalProps {
  collection: string;
  fields?: string[];
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const PLACEHOLDER = `{
  "field": "value"
}`;

type CreateMode = "json" | "form";

interface FieldRow {
  id: string;
  key: string;
  value: string;
}

const newRow = (): FieldRow => ({
  id: crypto.randomUUID(),
  key: "",
  value: "",
});

export function CreateDocumentModal({
  collection,
  fields = [],
  open,
  onClose,
  onCreated,
}: CreateDocumentModalProps) {
  const [raw, setRaw] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const [mode, setMode] = useState<CreateMode>("json");
  const [rows, setRows] = useState<FieldRow[]>([newRow()]);

  const handleChange = (value: string) => {
    setRaw(value);
    setParseError(null);
    setFormatted(false);
    if (!value.trim()) return;
    try {
      JSON.parse(value);
    } catch {
      setParseError("Invalid JSON");
    }
  };

  const isLikelySimpleObject = (obj: Record<string, unknown>) =>
    Object.values(obj).every(
      (v) => typeof v !== "object" || v === null || Array.isArray(v),
    );

  const objectToRows = (obj: Record<string, unknown>): FieldRow[] =>
    Object.entries(obj).map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value: value === null ? "null" : String(value),
    }));

  const parseObject = (): Record<string, unknown> | null => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setParseError("Document body cannot be empty.");
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        setParseError("Document must be a JSON object.");
        return null;
      }
      return parsed as Record<string, unknown>;
    } catch {
      setParseError("Invalid JSON.");
      return null;
    }
  };

  const parseFormValue = (rawValue: string): unknown => {
    const trimmed = rawValue.trim();
    if (trimmed === "") return "";
    if (trimmed === "null") return null;
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (!Number.isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
    return rawValue;
  };

  const rowsToObject = (): Record<string, unknown> | null => {
    const next: Record<string, unknown> = {};
    for (const row of rows) {
      const key = row.key.trim();
      if (!key) continue;
      if (key in next) {
        setParseError(`Duplicate key "${key}" in form.`);
        return null;
      }
      next[key] = parseFormValue(row.value);
    }
    if (Object.keys(next).length === 0) {
      setParseError("Add at least one field.");
      return null;
    }
    return next;
  };

  const switchMode = (nextMode: CreateMode) => {
    if (nextMode === mode) return;
    setParseError(null);

    if (nextMode === "form") {
      const obj = parseObject();
      if (obj && isLikelySimpleObject(obj)) {
        setRows(objectToRows(obj).length ? objectToRows(obj) : [newRow()]);
      } else if (!raw.trim()) {
        setRows([newRow()]);
      }
    } else {
      const obj = rowsToObject();
      if (obj) {
        setRaw(JSON.stringify(obj, null, 2));
        setFormatted(true);
      }
    }

    setMode(nextMode);
  };

  const applyTemplate = (template: "empty" | "withId" | "timestamps") => {
    let next: Record<string, unknown> = {};
    if (template === "withId") next = { _id: "", name: "" };
    if (template === "timestamps") {
      next = { name: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }
    setRaw(JSON.stringify(next, null, 2));
    setRows(objectToRows(next).length ? objectToRows(next) : [newRow()]);
    setParseError(null);
    setFormatted(true);
  };

  const addField = (field: string) => {
    const current = raw.trim() ? parseObject() : {};
    if (!current) return;
    if (!(field in current)) {
      current[field] = "";
    }
    setRaw(JSON.stringify(current, null, 2));
    if (mode === "form") {
      setRows(objectToRows(current));
    }
    setParseError(null);
    setFormatted(true);
  };

  const formatJson = () => {
    const obj = parseObject();
    if (!obj) return;
    setRaw(JSON.stringify(obj, null, 2));
    if (mode === "form") {
      setRows(objectToRows(obj));
    }
    setParseError(null);
    setFormatted(true);
    setTimeout(() => setFormatted(false), 900);
  };

  const handleCreate = async () => {
    const data = mode === "form" ? rowsToObject() : parseObject();
    if (!data) return;

    setSaving(true);
    setApiError(null);
    try {
      await createDocument(collection, data);
      setRaw("");
      setParseError(null);
      toast.success(`Document created in “${collection}”`);
      onCreated();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create document.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setRaw("");
    setRows([newRow()]);
    setMode("json");
    setParseError(null);
    setApiError(null);
    setFormatted(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && handleClose()}
      title={`New document — ${collection}`}
      description="Paste or type a valid JSON object."
    >
      <div className="flex flex-col gap-3">
        <div className="inline-flex w-fit rounded border border-zinc-800 bg-zinc-900 p-0.5">
          <button
            type="button"
            onClick={() => switchMode("json")}
            className={`rounded px-2.5 py-1 text-xs ${mode === "json" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => switchMode("form")}
            className={`rounded px-2.5 py-1 text-xs ${mode === "form" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Form
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-zinc-600">Templates</span>
          <button
            type="button"
            onClick={() => applyTemplate("empty")}
            className="rounded border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          >
            Empty
          </button>
          <button
            type="button"
            onClick={() => applyTemplate("withId")}
            className="rounded border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          >
            With id + name
          </button>
          <button
            type="button"
            onClick={() => applyTemplate("timestamps")}
            className="rounded border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          >
            With timestamps
          </button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-6 px-2 text-[11px]"
            onClick={formatJson}
            disabled={mode === "form" ? rows.length === 0 : !raw.trim()}
          >
            {formatted ? <Check size={11} className="text-emerald-400" /> : <Wand2 size={11} />}
            Format
          </Button>
        </div>

        {fields.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-600">Add field</span>
            {fields.slice(0, 8).map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => addField(field)}
                className="rounded border border-zinc-800 px-2 py-1 text-[11px] font-mono text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                title={`Insert "${field}"`}
              >
                {field}
              </button>
            ))}
          </div>
        )}

        {mode === "json" ? (
          <textarea
            className="h-52 w-full resize-none rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder={PLACEHOLDER}
            value={raw}
            onChange={(e) => handleChange(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="max-h-52 space-y-2 overflow-y-auto rounded border border-zinc-700 bg-zinc-900 p-2">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  value={row.key}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r)),
                    )
                  }
                  placeholder="field"
                  className="h-8 w-1/2 rounded border border-zinc-700 bg-zinc-950 px-2 font-mono text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
                <input
                  value={row.value}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                    )
                  }
                  placeholder="value"
                  className="h-8 w-1/2 rounded border border-zinc-700 bg-zinc-950 px-2 font-mono text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== row.id) : prev))
                  }
                  className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
                  title="Remove row"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, newRow()])}
              className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            >
              <Plus size={11} />
              Add row
            </button>
          </div>
        )}

        {parseError && <p className="text-xs text-red-400">{parseError}</p>}
        {apiError && <p className="text-xs text-red-400">{apiError}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={saving || !!parseError}
          >
            {saving ? "Creating…" : "Create"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
