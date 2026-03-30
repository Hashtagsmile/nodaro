import { Database, LogOut, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collections: string[];
  /** Document totals from loaded queries (cached per collection). */
  collectionCounts?: Record<string, number>;
  loading: boolean;
  onRefresh: () => void;
}

export function Sidebar({
  collections,
  collectionCounts = {},
  loading,
  onRefresh,
}: SidebarProps) {
  const { dbName, mongoUri, selectedCollection, selectCollection, disconnect } =
    useApp();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      collections.filter((c) =>
        c.toLowerCase().includes(search.toLowerCase()),
      ),
    [collections, search],
  );

  const displayName =
    dbName ||
    new URL(
      mongoUri.replace("mongodb+srv://", "https://").replace("mongodb://", "https://"),
    ).pathname.replace("/", "") ||
    "database";

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Connection header */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          <span className="text-xs font-medium text-zinc-300 truncate">
            {displayName}
          </span>
        </div>
        <button
          type="button"
          onClick={disconnect}
          className="flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-red-400 active:scale-[0.98]"
        >
          <LogOut size={11} />
          Disconnect
        </button>
      </div>

      {/* Collections list header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          Collections
          {collections.length > 0 && (
            <span className="ml-1.5 text-zinc-700">{collections.length}</span>
          )}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded p-1 text-zinc-600 transition-colors hover:text-zinc-400 disabled:opacity-40 active:scale-95"
          title="Refresh"
        >
          <RefreshCw size={12} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      {/* Search */}
      {collections.length > 5 && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter…"
              className="h-7 w-full rounded border border-zinc-800 bg-zinc-950/50 pl-7 pr-3 text-xs text-zinc-300 placeholder:text-zinc-700 focus:border-zinc-600 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading && collections.length === 0 ? (
          <div className="mt-4 space-y-1.5 px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-7 animate-pulse rounded bg-zinc-800/50"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <Database size={20} className="text-zinc-700" />
            <p className="text-xs text-zinc-600">No collections found</p>
          </div>
        ) : (
          filtered.map((name) => {
            const isSel = selectedCollection === name;
            const count = collectionCounts[name];
            return (
              <button
                key={name}
                type="button"
                onClick={() => selectCollection(name)}
                className={cn(
                  "group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-all",
                  isSel ?
                    "border-l-2 border-emerald-500 bg-zinc-800/90 pl-[10px] text-zinc-100 shadow-sm shadow-black/20"
                  : "border-l-2 border-transparent pl-[10px] text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
                )}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="shrink-0 font-mono text-[10px] text-zinc-600 group-hover:text-zinc-500">
                    //
                  </span>
                  <span className="truncate font-medium">{name}</span>
                </span>
                {count !== undefined && (
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                      isSel ?
                        "bg-emerald-950/50 text-emerald-400/90"
                      : "bg-zinc-800/80 text-zinc-500 group-hover:text-zinc-400",
                    )}
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
