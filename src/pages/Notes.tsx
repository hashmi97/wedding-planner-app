import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNotesStore } from "@/store";
import type { Note } from "@/api/types";

export function Notes() {
  const store = useNotesStore();
  const [open, setOpen] = useState(false);
  const [drawerNote, setDrawerNote] = useState<Note | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState<Partial<Note>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    store.fetch({ search: search || undefined });
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await store.update(editing.id, form);
    } else {
      await store.create(form);
    }
    setOpen(false);
    setEditing(null);
    setForm({});
  };

  const handleEdit = (n: Note) => {
    setEditing(n);
    setForm({ ...n });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this note?")) {
      await store.remove(id);
      setDrawerNote(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Decision log and notes</p>
        </div>
        <Button
          className="w-full sm:w-auto min-h-[44px]"
          onClick={() => { setEditing(null); setForm({}); setOpen(true); }}
        >
          Add Note
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <Label>Search</Label>
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {store.error && (
            <div className="text-destructive text-sm mb-4">{store.error}</div>
          )}

          {store.loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-2">
              {store.items.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setDrawerNote(n)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{n.title}</p>
                    {n.body && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap">{n.body}</p>
                    )}
                    {n.tags && (
                      <p className="text-xs text-muted-foreground mt-1">{n.tags}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] flex-1 sm:flex-none"
                      onClick={() => handleEdit(n)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive min-h-[44px] flex-1 sm:flex-none"
                      onClick={() => handleDelete(n.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!drawerNote} onOpenChange={(o) => !o && setDrawerNote(null)}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="pr-10">{drawerNote?.title}</SheetTitle>
          </SheetHeader>
          {drawerNote && (
            <div className="flex-1 mt-6 space-y-4 overflow-y-auto">
              {drawerNote.body ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Note</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {drawerNote.body}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No content</p>
              )}
              {drawerNote.tags && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tags</p>
                  <p className="text-sm text-foreground">{drawerNote.tags}</p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full min-h-[44px]"
                onClick={() => {
                  const note = drawerNote;
                  setDrawerNote(null);
                  handleEdit(note);
                }}
              >
                Edit Note
              </Button>
              <Button
                variant="outline"
                className="w-full min-h-[44px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(drawerNote.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Note" : "Add Note"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                value={form.body ?? ""}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Tags</Label>
              <Input
                value={form.tags ?? ""}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="comma-separated"
              />
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto min-h-[44px]">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto min-h-[44px]">{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
