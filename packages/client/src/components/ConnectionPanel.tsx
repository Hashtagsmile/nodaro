import { Database, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const EXAMPLES = [
  "mongodb://127.0.0.1:27017/mydb",
  "mongodb+srv://user:pass@cluster.mongodb.net/mydb",
];

export function ConnectionPanel() {
  const { connect, isConnecting, connectionError } = useApp();
  const [uri, setUri] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!uri.trim()) return;
    try {
      await connect(uri.trim());
      toast.success("Connected to MongoDB");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Connection failed",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
            <Database size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Nodaro</h1>
            <p className="text-xs text-zinc-500">MongoDB Admin Dashboard</p>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              MongoDB URI
            </label>
            <Input
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="mongodb://127.0.0.1:27017/mydb"
              className="h-10 font-mono text-sm"
              autoFocus
              spellCheck={false}
            />
          </div>

          {connectionError && (
            <p className="rounded border border-red-900/40 bg-red-950/30 px-3 py-2 text-xs text-red-400">
              {connectionError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isConnecting || !uri.trim()}
          >
            {isConnecting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Connecting…
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </form>

        <div className="mt-6">
          <p className="mb-2 text-xs text-zinc-600">Examples</p>
          <div className="space-y-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setUri(ex)}
                className="block w-full truncate rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-left font-mono text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
