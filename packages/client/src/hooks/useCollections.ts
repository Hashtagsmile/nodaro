import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getCollectionCounts, getCollections } from "../services/api";

export function useCollections(isConnected: boolean) {
  const [collections, setCollections] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    try {
      const [names, countMap] = await Promise.all([
        getCollections(),
        getCollectionCounts(),
      ]);
      setCollections(names);
      setCounts(countMap);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load collections";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      void refresh();
    } else {
      setCollections([]);
      setCounts({});
      setError(null);
    }
  }, [isConnected, refresh]);

  return { collections, counts, loading, error, refresh };
}
