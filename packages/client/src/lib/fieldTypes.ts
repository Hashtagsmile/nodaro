export const OBJECTID_RE = /^[0-9a-f]{24}$/i;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T[\d:.Z+]/;

export type FieldType =
  | "objectid"
  | "date"
  | "boolean"
  | "number"
  | "null"
  | "array"
  | "object"
  | "string";

export function isObjectId(v: unknown): v is string {
  return typeof v === "string" && OBJECTID_RE.test(v);
}

export function isDateString(v: unknown): v is string {
  return (
    typeof v === "string" &&
    ISO_DATE_RE.test(v) &&
    !isNaN(Date.parse(v))
  );
}

export function getFieldType(value: unknown): FieldType {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (isObjectId(value)) return "objectid";
  if (isDateString(value)) return "date";
  return "string";
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Compact id for headers: start + … + end (easier to scan than leading ellipsis). */
export function shortId(id: string): string {
  if (!id) return "";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-3)}`;
}
