import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MongoDocument } from "@/types";
import { deleteDocument, updateDocument } from "@/services/api";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { JSONEditor } from "./JSONEditor";

interface EditDocumentModalProps {
  document: MongoDocument | null;
  collection: string;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: MongoDocument) => void;
  onDeleted: (id: string) => void;
}

export function EditDocumentModal({
  document,
  collection,
  open,
  onClose,
  onSaved,
  onDeleted,
}: EditDocumentModalProps) {
  const [edited, setEdited] = useState<Record<string, unknown>>({});
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!document) return null;

  const handleSave = async () => {
    if (jsonError) return;
    setSaving(true);
    setApiError(null);
    try {
      const { _id, ...data } = edited;
      void _id;
      await updateDocument(collection, document._id, data);
      onSaved({ ...edited, _id: document._id });
      toast.success("Document saved");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this document from "${collection}"?`)) return;
    setDeleting(true);
    setApiError(null);
    try {
      await deleteDocument(collection, document._id);
      onDeleted(document._id);
      toast.success("Document deleted");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Edit document"
      description={`_id: ${document._id}`}
      className="max-w-2xl"
    >
      <JSONEditor
        value={document}
        onChange={setEdited}
        onError={setJsonError}
      />

      {apiError && (
        <p className="mt-3 rounded border border-red-900/40 bg-red-950/30 px-3 py-2 text-xs text-red-400">
          {apiError}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => void handleDelete()}
          disabled={deleting || saving}
        >
          {deleting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Trash2 size={13} />
          )}
          Delete
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={saving || !!jsonError}
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
