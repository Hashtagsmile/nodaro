import { useEffect, useState } from "react";
import { getSchema } from "../services/api";

export function useSchema(collection: string | null) {
  const [fields, setFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!collection) {
      setFields([]);
      return;
    }

    setLoading(true);
    getSchema(collection)
      .then((data) => setFields(data.schema))
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, [collection]);

  return { fields, loading };
}
