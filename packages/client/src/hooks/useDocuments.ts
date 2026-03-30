import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { queryDocuments, searchDocuments } from "../services/api";
import type { FilterRow, MongoDocument, QueryResult, SortInput } from "../types";
import { parseFilterValue } from "../lib/utils";

const PAGE_SIZE = 50;

export function useDocuments(collection: string) {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [skip, setSkip] = useState(0);
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [sort, setSort] = useState<SortInput | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isSearchMode = searchQuery.trim().length > 0;

  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(
    async (
      currentSkip: number,
      currentFilters: FilterRow[],
      currentSort: SortInput | null,
    ) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      const apiFilters = currentFilters
        .filter((f) => f.field.trim() && f.operator && f.value.trim() !== "")
        .map(({ field, operator, value }) => ({
          field,
          operator,
          value: parseFilterValue(operator, value),
        }));

      try {
        const data = await queryDocuments({
          collection,
          filters: apiFilters,
          limit: PAGE_SIZE,
          skip: currentSkip,
          sort: currentSort ?? undefined,
        });
        setResult(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Query failed";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [collection],
  );

  const fetchSearch = useCallback(
    async (q: string) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const data = await searchDocuments(collection, q);
        setResult(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Search failed";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [collection],
  );

  // Reset everything when collection changes
  useEffect(() => {
    setSkip(0);
    setFilters([]);
    setSort(null);
    setSearchQuery("");
    void fetch(0, [], null);
    return () => abortRef.current?.abort();
  }, [collection, fetch]);

  const applyFilters = useCallback(
    (newFilters: FilterRow[]) => {
      setFilters(newFilters);
      setSkip(0);
      void fetch(0, newFilters, sort);
    },
    [fetch, sort],
  );

  const applySort = useCallback(
    (newSort: SortInput | null) => {
      setSort(newSort);
      setSkip(0);
      void fetch(0, filters, newSort);
    },
    [fetch, filters],
  );

  const goToPage = useCallback(
    (newSkip: number) => {
      setSkip(newSkip);
      void fetch(newSkip, filters, sort);
    },
    [fetch, filters, sort],
  );

  const refetch = useCallback(() => {
    void fetch(skip, filters, sort);
  }, [fetch, skip, filters, sort]);

  const search = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (q.trim()) {
        void fetchSearch(q);
      } else {
        void fetch(skip, filters, sort);
      }
    },
    [fetchSearch, fetch, skip, filters, sort],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    void fetch(0, filters, sort);
  }, [fetch, filters, sort]);

  const updateLocal = useCallback((doc: MongoDocument) => {
    setResult((prev) =>
      prev
        ? {
            ...prev,
            documents: prev.documents.map((d) => (d._id === doc._id ? doc : d)),
          }
        : prev,
    );
  }, []);

  const removeLocal = useCallback((id: string) => {
    setResult((prev) =>
      prev
        ? {
            ...prev,
            documents: prev.documents.filter((d) => d._id !== id),
            total: prev.total - 1,
          }
        : prev,
    );
  }, []);

  return {
    result,
    loading,
    error,
    skip,
    pageSize: PAGE_SIZE,
    filters,
    sort,
    searchQuery,
    isSearchMode,
    applyFilters,
    applySort,
    goToPage,
    refetch,
    search,
    clearSearch,
    updateLocal,
    removeLocal,
  };
}
