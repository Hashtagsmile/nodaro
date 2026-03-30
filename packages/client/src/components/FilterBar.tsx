import { Filter, Plus, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { FilterRow } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

const OPERATORS = [
  { value: "eq", label: "=" },
  { value: "ne", label: "≠" },
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "regex", label: "~" },
  { value: "in", label: "in" },
  { value: "nin", label: "not in" },
  { value: "exists", label: "exists" },
];

const opLabel = (v: string) =>
  OPERATORS.find((o) => o.value === v)?.label ?? v;

function makeRow(): FilterRow {
  return { id: crypto.randomUUID(), field: "", operator: "eq", value: "" };
}

function isRowActive(r: FilterRow) {
  if (!r.field.trim() || !r.operator) return false;
  if (r.operator === "exists") return true;
  return r.value.trim() !== "";
}

interface FilterBarProps {
  fields: string[];
  /** Active filters from the server query (for chips + reset). */
  appliedFilters: FilterRow[];
  onApply: (filters: FilterRow[]) => void;
}

export function FilterBar({
  fields,
  appliedFilters,
  onApply,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [rows, setRows] = useState<FilterRow[]>([makeRow()]);

  const activeApplied = appliedFilters.filter(isRowActive);

  useEffect(() => {
    if (appliedFilters.length === 0) {
      setRows([makeRow()]);
    }
  }, [appliedFilters]);

  const update = (id: string, patch: Partial<FilterRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => {
    setRows((prev) =>
      prev.length === 1 ? [makeRow()] : prev.filter((r) => r.id !== id),
    );
  };

  const apply = () => {
    onApply(rows);
  };

  const clear = () => {
    setRows([makeRow()]);
    onApply([]);
  };

  const draftActive = rows.filter(isRowActive).length;

  return (
    <div className="border-b border-zinc-800 bg-zinc-950">
      {/* Always-visible toolbar + chips */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
            expanded
              ? "border-zinc-700 bg-zinc-900 text-zinc-200"
              : "border-transparent bg-zinc-900/40 text-zinc-500 hover:border-zinc-800 hover:text-zinc-300",
          )}
        >
          <Filter size={12} className="text-zinc-500" />
          <span>Filters</span>
          {activeApplied.length > 0 && (
            <span className="rounded bg-emerald-950/80 px-1.5 py-px text-[11px] font-medium text-emerald-400">
              {activeApplied.length}
            </span>
          )}
          {expanded ?
            <ChevronUp size={12} className="text-zinc-600" />
          : <ChevronDown size={12} className="text-zinc-600" />}
        </button>

        <button
          type="button"
          onClick={() => {
            setRows((prev) => [...prev, makeRow()]);
            setExpanded(true);
          }}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-emerald-800/60 hover:bg-zinc-900 hover:text-emerald-400/90"
        >
          <Plus size={12} />
          Add filter
        </button>

        {activeApplied.length > 0 && (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {activeApplied.map((r) => (
              <span
                key={r.id}
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-2 py-0.5 font-mono text-[11px] text-zinc-400"
                title={`${r.field} ${r.operator} ${r.value}`}
              >
                <span className="truncate text-zinc-300">{r.field}</span>
                <span className="text-zinc-600">{opLabel(r.operator)}</span>
                {r.operator !== "exists" && (
                  <span className="max-w-[120px] truncate text-zinc-500">
                    {r.value}
                  </span>
                )}
              </span>
            ))}
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X size={11} />
              Clear all
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-zinc-800/60 px-4 py-3 space-y-2 animate-fade-in">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              {fields.length > 0 ?
                <Select
                  value={row.field}
                  onChange={(e) => update(row.id, { field: e.target.value })}
                  className="w-40"
                >
                  <option value="">field…</option>
                  {fields.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </Select>
              : <Input
                  value={row.field}
                  onChange={(e) => update(row.id, { field: e.target.value })}
                  placeholder="field"
                  className="w-40 font-mono"
                />
              }

              <Select
                value={row.operator}
                onChange={(e) => update(row.id, { operator: e.target.value })}
                className="w-24"
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </Select>

              {row.operator === "exists" ?
                <Select
                  value={row.value}
                  onChange={(e) => update(row.id, { value: e.target.value })}
                  className="flex-1"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </Select>
              : <Input
                  value={row.value}
                  onChange={(e) => update(row.id, { value: e.target.value })}
                  placeholder={
                    row.operator === "in" || row.operator === "nin" ?
                      "a, b, c"
                    : "value"
                  }
                  className="flex-1 font-mono"
                />
              }

              <button
                type="button"
                onClick={() => remove(row.id)}
                className="rounded p-1.5 text-zinc-700 hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, makeRow()])}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Plus size={12} />
              Add filter
            </button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
                Collapse
              </Button>
              <Button variant="primary" size="sm" onClick={apply}>
                Apply
                {draftActive > 0 && (
                  <span className="ml-1 opacity-80">({draftActive})</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
