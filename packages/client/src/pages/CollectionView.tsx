import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import type { FilterRow, MongoDocument } from "@/types";
import { useDocuments } from "@/hooks/useDocuments";
import { useDebounce } from "@/hooks/useDebounce";
import { useSchema } from "@/hooks/useSchema";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentPanel } from "@/components/DocumentPanel";
import { FilterBar } from "@/components/FilterBar";
import { CreateDocumentModal } from "@/components/CreateDocumentModal";

interface CollectionViewProps {
  collection: string;
}

export function CollectionView({ collection }: CollectionViewProps) {
  const PANEL_MIN = 320;
  const PANEL_MAX = 720;

  const { fields } = useSchema(collection);
  const {
    result,
    loading,
    error,
    skip,
    pageSize,
    filters,
    sort,
    isSearchMode,
    applyFilters,
    applySort,
    goToPage,
    refetch,
    search,
    clearSearch,
    updateLocal,
    removeLocal,
  } = useDocuments(collection);

  const [selectedDoc, setSelectedDoc] = useState<MongoDocument | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [panelWidth, setPanelWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(panelWidth);

  const debouncedSearch = useDebounce(searchInput, 300);

  const searchDebouncing =
    searchInput.trim() !== debouncedSearch.trim();

  // Sync debounced search value into the hook
  useEffect(() => {
    search(debouncedSearch);
  }, [debouncedSearch, search]);

  // Reset search input when collection changes
  useEffect(() => {
    setSearchInput("");
    setSelectedDoc(null);
  }, [collection]);

  const hasActiveFilters = filters.some(
    (f) => f.field.trim() && f.value.trim(),
  );

  const handleClearSearch = () => {
    setSearchInput("");
    clearSearch();
  };

  const handleColumnFilter = (field: string, value: unknown) => {
    const v =
      value === null ? "null"
      : typeof value === "boolean" ? (value ? "true" : "false")
      : String(value);

    const matchesQuickFilter = (f: FilterRow) =>
      f.field.trim() === field.trim() &&
      f.operator === "eq" &&
      f.value.trim() === v.trim();

    const existingIdx = filters.findIndex(matchesQuickFilter);

    setSearchInput("");
    search("");

    if (existingIdx >= 0) {
      applyFilters(filters.filter((_, i) => i !== existingIdx));
    } else {
      const row: FilterRow = {
        id: crypto.randomUUID(),
        field,
        operator: "eq",
        value: v,
      };
      applyFilters([...filters, row]);
    }
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = panelWidth;
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      const delta = resizeStartX.current - e.clientX;
      const next = Math.min(
        PANEL_MAX,
        Math.max(PANEL_MIN, resizeStartWidth.current + delta),
      );
      setPanelWidth(next);
    };

    const onMouseUp = () => setIsResizing(false);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header — search is primary */}
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="flex min-w-0 shrink-0 items-baseline gap-2">
            <h2 className="font-mono text-sm font-medium text-zinc-200">
              {collection}
            </h2>
            {result && !isSearchMode && (
              <span className="text-xs text-zinc-600">
                {result.total.toLocaleString()} docs
              </span>
            )}
          </div>

          <div className="relative min-h-[40px] min-w-[200px] flex-1 max-w-2xl">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-emerald-500/80"
              aria-hidden
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by ID, email, or field value..."
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900/90 pl-10 pr-32 text-sm text-zinc-100 shadow-md shadow-black/25 placeholder:text-zinc-500 focus:border-emerald-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-900/40"
            />
            <div className="absolute right-2 top-1/2 z-[1] flex -translate-y-1/2 items-center gap-1">
              {(searchDebouncing || (loading && searchInput.trim().length > 0)) && (
                <span
                  className="flex items-center gap-1 text-[11px] text-zinc-500"
                  aria-live="polite"
                >
                  <Loader2
                    size={14}
                    className="shrink-0 animate-spin text-emerald-500/90"
                  />
                  <span className="hidden sm:inline">Searching…</span>
                </span>
              )}
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-zinc-800 active:scale-[0.98]"
          >
            <Plus size={14} />
            New
          </button>
        </div>

        {!isSearchMode && (
          <FilterBar
            key={collection}
            fields={fields}
            appliedFilters={filters}
            onApply={applyFilters}
          />
        )}

        {isSearchMode && (
          <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/40 px-4 py-1.5">
            <span className="text-xs text-zinc-500">
              Search results for{" "}
              <span className="font-mono text-zinc-300">"{debouncedSearch}"</span>
            </span>
            <button
              onClick={handleClearSearch}
              className="ml-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        <DocumentTable
          collection={collection}
          documents={result?.documents ?? []}
          loading={loading}
          error={error}
          total={result?.total ?? 0}
          skip={skip}
          pageSize={pageSize}
          sort={sort}
          selectedId={selectedDoc?._id ?? null}
          hasActiveFilters={hasActiveFilters}
          isSearchMode={isSearchMode}
          onSort={applySort}
          onPageChange={goToPage}
          onSelect={setSelectedDoc}
          onClearFilters={() => applyFilters([])}
          onClearSearch={handleClearSearch}
          onColumnFilter={handleColumnFilter}
        />
      </div>

      {/* Side panel */}
      {selectedDoc && (
        <>
          <div
            onMouseDown={handleResizeStart}
            className="w-1 cursor-col-resize bg-zinc-800/40 transition-colors hover:bg-emerald-600/60"
            role="separator"
            aria-label="Resize details panel"
            aria-orientation="vertical"
          />
          <DocumentPanel
            document={selectedDoc}
            collection={collection}
            width={panelWidth}
            className="animate-panel-in"
            onClose={() => setSelectedDoc(null)}
            onSaved={(updated) => {
              updateLocal(updated);
              setSelectedDoc(updated);
            }}
            onDeleted={(id) => {
              removeLocal(id);
              setSelectedDoc(null);
            }}
          />
        </>
      )}

      {/* Create modal */}
      <CreateDocumentModal
        collection={collection}
        fields={fields}
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          refetch();
          setSelectedDoc(null);
        }}
      />
    </div>
  );
}
