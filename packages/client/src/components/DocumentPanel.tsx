import { Check, Copy, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { MongoDocument } from "@/types";
import { updateDocument, deleteDocument } from "@/services/api";
import { cn } from "@/lib/utils";
import { getFieldType, isDateString, shortId } from "@/lib/fieldTypes";
import { FieldValue, getInputType, parseInputValue } from "./FieldValue";
import { Button } from "./ui/button";

interface DocumentPanelProps {
  document: MongoDocument;
  collection: string;
  width: number;
  className?: string;
  onClose: () => void;
  onSaved: (doc: MongoDocument) => void;
  onDeleted: (id: string) => void;
}

const META_FIELDS = new Set(["_id", "createdAt", "updatedAt", "__v"]);

export function DocumentPanel({
  document,
  collection,
  width,
  className,
  onClose,
  onSaved,
  onDeleted,
}: DocumentPanelProps) {
  const [edits, setEdits] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Reset on document change
  useEffect(() => {
    setEdits({});
    setApiError(null);
    setCopiedId(false);
  }, [document._id]);

  const changedCount = Object.keys(edits).length;

  const handleFieldChange = (field: string, value: unknown) => {
    setEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (changedCount === 0) return;
    setSaving(true);
    setApiError(null);
    try {
      const payload: Record<string, unknown> = { ...edits };
      delete payload._id;
      await updateDocument(collection, document._id, payload);
      onSaved({ ...document, ...edits });
      setEdits({});
      toast.success("Document saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this document from "${collection}"?`)) return;
    setDeleting(true);
    setApiError(null);
    try {
      await deleteDocument(collection, document._id);
      onDeleted(document._id);
      toast.success("Document deleted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const allFields = Object.keys(document);
  const metaFields = allFields.filter((f) => META_FIELDS.has(f));
  const userFields = allFields.filter((f) => !META_FIELDS.has(f));

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(document._id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 900);
    } catch {
      // no-op
    }
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-shrink-0 flex-col border-l border-zinc-800 bg-zinc-950",
        className,
      )}
      style={{ width }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between border-b border-zinc-800 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-300">{collection}</p>
          <p
            className="mt-0.5 font-mono text-xs text-zinc-600"
            title={document._id}
          >
            {shortId(document._id)}
          </p>
          <button
            type="button"
            onClick={() => void handleCopyId()}
            className="mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
            title={copiedId ? "Copied" : "Copy full ID"}
          >
            {copiedId ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
            {copiedId ? "Copied" : "Copy ID"}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300 active:scale-95"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 py-4">
        {/* Metadata */}
        {metaFields.length > 0 && (
          <section>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
              Metadata
            </p>
            <div className="space-y-2">
              {metaFields.map((field) => (
                <FieldRow
                  key={field}
                  field={field}
                  value={document[field]}
                  editedValue={edits[field]}
                  readOnly
                  onChange={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {/* User fields */}
        {userFields.length > 0 && (
          <section>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
              Fields
            </p>
            <div className="space-y-2">
              {userFields.map((field) => (
                <FieldRow
                  key={field}
                  field={field}
                  value={document[field]}
                  editedValue={edits[field]}
                  readOnly={false}
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer — pinned below scroll area */}
      <div className="shrink-0 space-y-2 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md">
        {apiError && (
          <p className="rounded border border-red-900/40 bg-red-950/30 px-2.5 py-1.5 text-xs text-red-400">
            {apiError}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void handleDelete()}
            disabled={deleting || saving}
          >
            {deleting ?
              <Loader2 size={13} className="animate-spin" />
            : <Trash2 size={13} />}
            Delete
          </Button>

          <div className="flex items-center gap-2">
            {changedCount > 0 && (
              <button
                onClick={() => setEdits({})}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Discard
              </button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleSave()}
              disabled={changedCount === 0 || saving}
            >
              {saving ?
                <Loader2 size={13} className="animate-spin" />
              : <Check size={13} />}
              Save{changedCount > 0 ? ` (${changedCount})` : ""}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

interface FieldRowProps {
  field: string;
  value: unknown;
  editedValue: unknown;
  readOnly: boolean;
  onChange: (field: string, value: unknown) => void;
}

function FieldRow({
  field,
  value,
  editedValue,
  readOnly,
  onChange,
}: FieldRowProps) {
  const isEdited = editedValue !== undefined;
  const displayValue = isEdited ? editedValue : value;
  const [editing, setEditing] = useState(false);

  const fieldType = getFieldType(value);
  const canEdit = !readOnly && fieldType !== "object" && fieldType !== "array";

  return (
    <div
      className={cn(
        "group flex items-start gap-2 rounded-md px-1 py-1.5 transition-colors",
        canEdit && "hover:bg-zinc-900/80",
        !canEdit && "hover:bg-zinc-900/40",
      )}
    >
      {/* Field name */}
      <div className="flex w-28 shrink-0 items-center gap-1 pt-0.5">
        <span
          className="truncate font-mono text-[11px] text-zinc-500"
          title={field}
        >
          {field}
        </span>
        {isEdited && (
          <span className="h-1 w-1 shrink-0 rounded-full bg-amber-400" />
        )}
      </div>

      {/* Value */}
      <div className="relative min-w-0 flex-1">
        {editing && canEdit ?
          <InlineInput
            value={displayValue}
            originalType={value}
            onCommit={(v) => {
              onChange(field, v);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        : canEdit ?
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "flex w-full items-start gap-2 rounded-md border border-transparent px-1.5 py-1 text-left transition-all",
              "hover:border-zinc-700 hover:bg-zinc-800/90",
            )}
          >
            <span className="min-w-0 flex-1">
              <FieldValue value={displayValue} context="panel" />
            </span>
            <Pencil
              size={11}
              className="mt-0.5 shrink-0 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </button>
        : <div className="px-1.5 py-1">
            <FieldValue value={displayValue} context="panel" />
          </div>
        }
      </div>
    </div>
  );
}

// ─── InlineInput ──────────────────────────────────────────────────────────────

interface InlineInputProps {
  value: unknown;
  originalType: unknown;
  onCommit: (value: unknown) => void;
  onCancel: () => void;
}

function InlineInput({
  value,
  originalType,
  onCommit,
  onCancel,
}: InlineInputProps) {
  const fieldType = getFieldType(originalType);
  const inputType = getInputType(originalType);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const toInputValue = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    if (isDateString(v)) {
      // Format for datetime-local input
      try {
        return new Date(v as string).toISOString().slice(0, 16);
      } catch {
        return String(v);
      }
    }
    return String(v);
  };

  const [raw, setRaw] = useState(toInputValue(value));

  const commit = () => {
    onCommit(parseInputValue(raw, originalType));
  };

  if (fieldType === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <select
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={commit}
          className="h-6 rounded border border-zinc-700 bg-zinc-900 px-1.5 text-xs text-zinc-100 focus:outline-none"
          autoFocus
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
        <button
          onClick={commit}
          className="text-emerald-400 hover:text-emerald-300"
        >
          <Check size={12} />
        </button>
        <button
          onClick={onCancel}
          className="text-zinc-600 hover:text-zinc-400"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type={inputType}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        className="h-6 w-full rounded border border-zinc-600 bg-zinc-900 px-2 font-mono text-xs text-zinc-100 focus:border-zinc-400 focus:outline-none"
      />
    </div>
  );
}
