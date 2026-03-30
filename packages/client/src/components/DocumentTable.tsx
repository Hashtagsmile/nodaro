import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Filter,
  Loader2,
  SearchX,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { MongoDocument, SortInput } from "@/types";
import { getFieldType } from "@/lib/fieldTypes";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { FieldValue } from "./FieldValue";

interface DocumentTableProps {
  collection: string;
  documents: MongoDocument[];
  loading: boolean;
  error: string | null;
  total: number;
  skip: number;
  pageSize: number;
  sort: SortInput | null;
  selectedId: string | null;
  hasActiveFilters: boolean;
  isSearchMode?: boolean;
  onSort: (sort: SortInput | null) => void;
  onPageChange: (skip: number) => void;
  onSelect: (doc: MongoDocument) => void;
  onClearFilters: () => void;
  onClearSearch?: () => void;
  /** Add `field = value` filter from a table cell (scalar values only). */
  onColumnFilter?: (field: string, value: unknown) => void;
}

function canAddFilter(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const t = getFieldType(value);
  return t !== "object" && t !== "array";
}

const COL_MIN = 100;
const COL_MAX = 520;
const defaultColWidth = (col: string) => (col === "_id" ? 140 : 176);

export function DocumentTable({
  collection,
  documents,
  loading,
  error,
  total,
  skip,
  pageSize,
  sort,
  selectedId,
  hasActiveFilters,
  isSearchMode = false,
  onSort,
  onPageChange,
  onSelect,
  onClearFilters,
  onClearSearch,
  onColumnFilter,
}: DocumentTableProps) {
  const columns = useMemo(() => {
    if (documents.length === 0) return [];
    const keys = new Set<string>();
    documents.slice(0, 20).forEach((doc) => {
      Object.keys(doc).forEach((k) => keys.add(k));
    });
    return ["_id", ...Array.from(keys).filter((k) => k !== "_id")];
  }, [documents]);

  const storageKey = `nodaro:colwidths:${collection}`;
  const [colWidths, setColWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setColWidths(JSON.parse(raw) as Record<string, number>);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    if (columns.length === 0) return;
    setColWidths((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const c of columns) {
        if (next[c] === undefined) {
          next[c] = defaultColWidth(c);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [columns]);

  const getColWidth = useCallback(
    (col: string) => colWidths[col] ?? defaultColWidth(col),
    [colWidths],
  );

  const tableWidth = useMemo(
    () => columns.reduce((acc, col) => acc + getColWidth(col), 0),
    [columns, getColWidth],
  );

  const startResize = (col: string, e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = getColWidth(col);
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const w = Math.min(COL_MAX, Math.max(COL_MIN, startW + delta));
      setColWidths((p) => ({ ...p, [col]: w }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setColWidths((p) => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(p));
        } catch {
          /* ignore */
        }
        return p;
      });
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const currentPage = Math.floor(skip / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSort = (field: string) => {
    if (sort?.field === field) {
      onSort(sort.direction === "asc" ? { field, direction: "desc" } : null);
    } else {
      onSort({ field, direction: "asc" });
    }
  };

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <p className="text-sm font-medium text-red-400">Query failed</p>
          <p className="mt-1 text-xs text-zinc-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!loading && documents.length === 0) {
    const hasContext = hasActiveFilters || isSearchMode;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 animate-fade-in">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
          <SearchX size={18} className="text-zinc-600" />
        </div>
        <div className="max-w-sm text-center">
          <p className="text-sm font-medium text-zinc-300">
            {hasContext ? "No results found" : "No documents"}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
            {hasContext ?
              "Try clearing filters or searching for something else."
            : "This collection is empty."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isSearchMode && onClearSearch && (
            <Button variant="outline" size="sm" onClick={onClearSearch}>
              Clear search
            </Button>
          )}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="relative min-h-0 w-full min-w-0 flex-1 overflow-auto">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-start justify-center pt-16 bg-zinc-950/50 backdrop-blur-[1px] animate-fade-in">
            <Loader2 size={18} className="animate-spin text-zinc-500" />
          </div>
        )}

        <table
          className="w-full border-separate border-spacing-0"
          style={{
            width: "100%",
            minWidth: tableWidth,
            tableLayout: "fixed",
          }}
        >
          <thead className="sticky top-0 z-10 bg-zinc-900 shadow-[0_1px_0_0] shadow-zinc-800">
            <tr className="border-b border-zinc-800">
              {columns.map((col, colIdx) => {
                const isLast = colIdx === columns.length - 1;
                return (
                <th
                  key={col}
                  style={
                    isLast ?
                      { width: "auto", minWidth: getColWidth(col) }
                    : { width: getColWidth(col), minWidth: COL_MIN }
                  }
                  className="relative border-r border-zinc-800/80 px-0 py-2.5 text-left align-top"
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col)}
                    className="flex w-full min-w-0 items-center gap-1.5 px-3 pr-2 text-left font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                  >
                    <span className="min-w-0 truncate">{col}</span>
                    {sort?.field === col ?
                      sort.direction === "asc" ?
                        <ArrowUp size={10} className="shrink-0 text-emerald-400" />
                      : <ArrowDown size={10} className="shrink-0 text-emerald-400" />
                    : <ArrowUpDown size={10} className="shrink-0 text-zinc-700" />}
                  </button>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    className="absolute right-0 top-0 z-20 h-full w-1.5 cursor-col-resize border-0 bg-transparent p-0 hover:bg-emerald-500/25"
                    onMouseDown={(e) => startResize(col, e)}
                  />
                </th>
                );
              })}
            </tr>
          </thead>
          <tbody
            className={cn(
              "transition-opacity duration-200",
              loading && "opacity-50",
            )}
          >
            {documents.map((doc, i) => (
              <tr
                key={doc._id}
                onClick={() => onSelect(doc)}
                className={cn(
                  "cursor-pointer border-b border-zinc-800/40 transition-colors duration-150 hover:bg-zinc-800/35 active:bg-zinc-800/55",
                  i % 2 !== 0 && "bg-zinc-900/15",
                  doc._id === selectedId &&
                    "bg-zinc-800/55 ring-1 ring-inset ring-emerald-500/35 hover:bg-zinc-800/65",
                )}
              >
                {columns.map((col, colIdx) => {
                  const isLast = colIdx === columns.length - 1;
                  return (
                  <td
                    key={col}
                    style={
                      isLast ?
                        { width: "auto", minWidth: getColWidth(col) }
                      : { width: getColWidth(col), minWidth: COL_MIN }
                    }
                    className="group/cell overflow-hidden border-r border-zinc-800/40 px-3 py-2 align-top"
                  >
                    <div className="flex items-start gap-0.5">
                      <div className="min-w-0 flex-1">
                        {col in doc ?
                          <FieldValue value={doc[col]} context="table" />
                        : null}
                      </div>
                      {onColumnFilter && col in doc && canAddFilter(doc[col]) && (
                        <button
                          type="button"
                          title="Filter by this value"
                          className="mt-0.5 shrink-0 rounded p-0.5 text-zinc-600 opacity-0 transition-all hover:bg-zinc-800 hover:text-emerald-400 group-hover/cell:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            onColumnFilter(col, doc[col]);
                          }}
                        >
                          <Filter size={11} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </td>
                );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-4 py-2">
        <span className="text-xs text-zinc-600">
          {total === 0 ?
            "0 results"
          : `${skip + 1}–${Math.min(skip + pageSize, total)} of `}
          {total > 0 && (
            <span className="text-zinc-400">{total.toLocaleString()}</span>
          )}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.max(0, skip - pageSize))}
            disabled={skip === 0 || loading}
          >
            ← Prev
          </Button>
          <span className="px-2 text-xs tabular-nums text-zinc-600">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(skip + pageSize)}
            disabled={skip + pageSize >= total || loading}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
