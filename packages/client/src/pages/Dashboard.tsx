import { Database } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useCollections } from "@/hooks/useCollections";
import { Sidebar } from "@/components/Sidebar";
import { CollectionView } from "./CollectionView";

export function Dashboard() {
  const { isConnected, selectedCollection } = useApp();
  const { collections, counts, loading, refresh } = useCollections(isConnected);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar
        collections={collections}
        collectionCounts={counts}
        loading={loading}
        onRefresh={refresh}
      />

      <main className="flex flex-1 overflow-hidden">
        {selectedCollection ?
          <CollectionView collection={selectedCollection} />
        : <EmptyState />}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
        <Database size={22} className="text-zinc-600" />
      </div>
      <p className="text-sm text-zinc-500">Select a collection to explore</p>
    </div>
  );
}
