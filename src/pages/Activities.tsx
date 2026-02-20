import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useActivitiesStore } from "@/store";
import type { Activity } from "@/api/types";

type SortKey = "title" | "date" | "location";

export function Activities() {
  const store = useActivitiesStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [drawerActivity, setDrawerActivity] = useState<Activity | null>(null);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState<Partial<Activity>>({});
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(true);

  const sortedItems = useMemo(() => {
    const items = [...store.items];
    items.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = (a.title ?? "").localeCompare(b.title ?? "");
      else if (sortKey === "date") {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        cmp = da - db;
      } else if (sortKey === "location") cmp = (a.location ?? "").localeCompare(b.location ?? "");
      return sortAsc ? cmp : -cmp;
    });
    return items;
  }, [store.items, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((prev) => !prev);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const SortHeader = ({ label, sortKey: k }: { label: string; sortKey: SortKey }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(k)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === k ? (sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : null}
      </div>
    </TableHead>
  );

  useEffect(() => {
    store.fetch({ search: search || undefined });
  }, [search]);

  useEffect(() => {
    const editId = (location.state as { editId?: string } | null)?.editId;
    if (editId && store.items.length > 0) {
      const activity = store.items.find((a) => a.id === editId);
      if (activity) {
        handleEdit(activity);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, store.items]);

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

  const handleEdit = (a: Activity) => {
    setEditing(a);
    setForm({ ...a });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this appointment?")) {
      await store.remove(id);
      setDrawerActivity(null);
    }
  };

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "title", label: "Title" },
    { value: "date", label: "Date" },
    { value: "location", label: "Location" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Schedule and Appointments</h1>
          <p className="text-muted-foreground">Manage wedding events and appointments</p>
        </div>
        <Button
          className="w-full sm:w-auto min-h-[44px]"
          onClick={() => { setEditing(null); setForm({}); setOpen(true); }}
        >
          Add Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 sm:flex-wrap">
            <div className="flex-1 min-w-0">
              <Label>Search</Label>
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {store.error && (
        <div className="text-destructive text-sm">{store.error}</div>
      )}

      <Card>
        <CardContent className="pt-6">
          {store.loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              {/* Mobile sort + card view */}
              <div className="sm:hidden space-y-4">
                <div>
                  <Label>Sort by</Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setSortAsc((p) => !p)}>
                      {sortAsc ? "↑" : "↓"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {sortedItems.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setDrawerActivity(a)}
                    >
                      <p className="font-medium">{a.title}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        {a.date && <span>{a.date}</span>}
                        {(a.startTime || a.endTime) && (
                          <span>
                            {a.startTime && a.endTime
                              ? `${a.startTime} - ${a.endTime}`
                              : a.startTime || a.endTime}
                          </span>
                        )}
                        {a.location && <span>{a.location}</span>}
                      </div>
                      {a.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.notes}</p>
                      )}
                      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="min-h-[44px] flex-1"
                          onClick={() => { setDrawerActivity(null); handleEdit(a); }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive min-h-[44px] flex-1"
                          onClick={() => handleDelete(a.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Desktop table view */}
              <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader label="Title" sortKey="title" />
                  <SortHeader label="Date" sortKey="date" />
                  <TableHead>Time</TableHead>
                  <SortHeader label="Location" sortKey="location" />
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setDrawerActivity(a)}
                  >
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>
                      {a.startTime && a.endTime
                        ? `${a.startTime} - ${a.endTime}`
                        : a.startTime || "-"}
                    </TableCell>
                    <TableCell>{a.location || "-"}</TableCell>
                    <TableCell className="max-w-[300px] whitespace-pre-wrap text-sm text-muted-foreground">
                      {a.notes ? (
                        <span className="block">{a.notes}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setDrawerActivity(null); handleEdit(a); }}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(a.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!drawerActivity} onOpenChange={(o) => !o && setDrawerActivity(null)}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="pr-10">{drawerActivity?.title}</SheetTitle>
          </SheetHeader>
          {drawerActivity && (
            <div className="flex-1 mt-6 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {drawerActivity.date && <span>Date: {drawerActivity.date}</span>}
                {(drawerActivity.startTime || drawerActivity.endTime) && (
                  <span>
                    Time: {drawerActivity.startTime && drawerActivity.endTime
                      ? `${drawerActivity.startTime} – ${drawerActivity.endTime}`
                      : drawerActivity.startTime || drawerActivity.endTime}
                  </span>
                )}
              </div>
              {drawerActivity.location && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                  <p className="text-sm text-foreground">{drawerActivity.location}</p>
                </div>
              )}
              {drawerActivity.notes ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {drawerActivity.notes}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes</p>
              )}
              <Button
                variant="outline"
                className="w-full min-h-[44px]"
                onClick={() => {
                  const act = drawerActivity;
                  setDrawerActivity(null);
                  handleEdit(act);
                }}
              >
                Edit Appointment
              </Button>
              <Button
                variant="outline"
                className="w-full min-h-[44px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(drawerActivity.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Appointment" : "Add Appointment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title ?? ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date ?? ""}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime ?? ""}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime ?? ""}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Location</Label>
                <Input
                  value={form.location ?? ""}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
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
