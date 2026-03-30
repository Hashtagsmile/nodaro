import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface JSONEditorProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onError: (error: string | null) => void;
  className?: string;
}

export function JSONEditor({ value, onChange, onError, className }: JSONEditorProps) {
  const [raw, setRaw] = useState(() => JSON.stringify(value, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    setRaw(JSON.stringify(value, null, 2));
  }, [value]);

  const handleChange = (text: string) => {
    setRaw(text);
    try {
      const parsed = JSON.parse(text) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Must be a JSON object");
      }
      setParseError(null);
      onError(null);
      onChange(parsed as Record<string, unknown>);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid JSON";
      setParseError(msg);
      onError(msg);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <textarea
        value={raw}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        rows={16}
        className={cn(
          "w-full resize-none rounded border bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200",
          "focus:outline-none",
          parseError
            ? "border-red-800 focus:border-red-700"
            : "border-zinc-800 focus:border-zinc-600",
        )}
      />
      {parseError && (
        <p className="text-xs text-red-400">{parseError}</p>
      )}
    </div>
  );
}
