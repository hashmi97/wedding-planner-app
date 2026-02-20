import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { config } from "@/config";
import { useTasksStore } from "@/store";
import type { Task } from "@/api/types";

const KANBAN_COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "doing", label: "Doing" },
  { id: "done", label: "Done" },
];

const ASSIGNEES = [config.groomName, config.brideName] as const;

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  medium: "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100",
  high: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
};

function KanbanCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onView,
}: {
  task: Task;
  onStatusChange: (task: Task, status: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onView: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border p-3 bg-background hover:bg-muted/50 flex gap-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing shrink-0 pt-0.5 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(task)}>
      <p className="font-medium">{task.title}</p>
      {task.assignee && (
        <p className="text-sm text-muted-foreground mt-0.5">{task.assignee}</p>
      )}
      {task.dueDate && (
        <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
      )}
      {task.priority && (
        <Badge
          variant="secondary"
          className={`mt-1 ${PRIORITY_COLORS[task.priority] ?? "bg-muted"}`}
        >
          {task.priority}
        </Badge>
      )}
      <div className="flex gap-2 mt-2 flex-wrap min-h-[44px] items-center" onClick={(e) => e.stopPropagation()}>
        {KANBAN_COLUMNS.filter((c) => c.id !== (task.status || "todo")).map((c) => (
          <Button
            key={c.id}
            variant="ghost"
            size="sm"
            className="min-h-[44px] sm:min-h-0"
            onClick={() => onStatusChange(task, c.id)}
          >
            {c.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="min-h-[44px] sm:min-h-0" onClick={() => onEdit(task)}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive min-h-[44px] sm:min-h-0"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>
      </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onView,
}: {
  column: (typeof KANBAN_COLUMNS)[number];
  tasks: Task[];
  onStatusChange: (task: Task, status: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onView: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <Card className={isOver ? "ring-2 ring-primary" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{column.label}</CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="space-y-2 min-h-[120px]">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function Tasks() {
  const store = useTasksStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [open, setOpen] = useState(false);
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>({});

  useEffect(() => {
    store.fetch();
  }, []);

  useEffect(() => {
    const editId = (location.state as { editId?: string } | null)?.editId;
    if (editId && store.items.length > 0) {
      const task = store.items.find((t) => t.id === editId);
      if (task) {
        handleEdit(task);
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

  const handleStatusChange = async (task: Task, status: string) => {
    await store.update(task.id, { ...task, status });
  };

  const handleEdit = (t: Task) => {
    setEditing(t);
    setForm({ ...t });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this task?")) {
      await store.remove(id);
      setDrawerTask(null);
    }
  };

  type TaskSortKey = "title" | "dueDate" | "assignee" | "priority" | "status";
  const [taskSortKey, setTaskSortKey] = useState<TaskSortKey>("dueDate");
  const [taskSortAsc, setTaskSortAsc] = useState(true);

  const sortedItems = useMemo(() => {
    const items = [...store.items];
    items.sort((a, b) => {
      let cmp = 0;
      if (taskSortKey === "title") cmp = (a.title ?? "").localeCompare(b.title ?? "");
      else if (taskSortKey === "dueDate") {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = da - db;
      } else if (taskSortKey === "assignee") cmp = (a.assignee ?? "").localeCompare(b.assignee ?? "");
      else if (taskSortKey === "priority") {
        const order = { high: 0, medium: 1, low: 2 };
        cmp = (order[a.priority as keyof typeof order] ?? 3) - (order[b.priority as keyof typeof order] ?? 3);
      } else if (taskSortKey === "status") {
        const order = { todo: 0, doing: 1, done: 2 };
        const sa = a.status || "todo";
        const sb = b.status || "todo";
        cmp = (order[sa as keyof typeof order] ?? 3) - (order[sb as keyof typeof order] ?? 3);
      }
      return taskSortAsc ? cmp : -cmp;
    });
    return items;
  }, [store.items, taskSortKey, taskSortAsc]);

  const byStatus = (status: string) =>
    sortedItems.filter((t) => (t.status || "todo") === status);

  const handleTaskSort = (key: TaskSortKey) => {
    if (taskSortKey === key) setTaskSortAsc((prev) => !prev);
    else {
      setTaskSortKey(key);
      setTaskSortAsc(true);
    }
  };

  const TaskSortHeader = ({ label, sortKey: k }: { label: string; sortKey: TaskSortKey }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleTaskSort(k)}
    >
      <div className="flex items-center gap-1">
        {label}
        {taskSortKey === k ? (taskSortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : null}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your wedding tasks</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:items-center">
          <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:inline-flex">
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            className="w-full sm:w-auto min-h-[44px]"
            onClick={() => { setEditing(null); setForm({ priority: "low" }); setOpen(true); }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {store.error && (
        <div className="text-destructive text-sm">{store.error}</div>
      )}

      {store.loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : view === "kanban" ? (
        <DndContext
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event;
            if (!over) return;
            const taskId = active.id as string;
            let targetStatus: string | null = null;
            if (KANBAN_COLUMNS.some((c) => c.id === over.id)) {
              targetStatus = over.id as string;
            } else {
              const task = store.items.find((t) => t.id === over.id);
              if (task) targetStatus = task.status || "todo";
            }
            if (targetStatus) {
              const task = store.items.find((t) => t.id === taskId);
              if (task && (task.status || "todo") !== targetStatus) {
                handleStatusChange(task, targetStatus);
              }
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={byStatus(col.id)}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={setDrawerTask}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {/* Mobile card view for list */}
            <div className="sm:hidden space-y-2">
              {sortedItems.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border p-4 hover:bg-muted/50 transition-colors flex flex-col gap-2 cursor-pointer"
                  onClick={() => setDrawerTask(t)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium">{t.title}</p>
                    <Badge
                      variant="secondary"
                      className={PRIORITY_COLORS[t.priority ?? ""] ?? "bg-muted"}
                    >
                      {t.priority || "-"}
                    </Badge>
                  </div>
                  {t.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {t.assignee && <span>{t.assignee}</span>}
                    {t.dueDate && <span>Due: {t.dueDate}</span>}
                    <span>{t.status || "todo"}</span>
                  </div>
                  <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] flex-1"
                      onClick={() => { setDrawerTask(null); handleEdit(t); }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive min-h-[44px] flex-1"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table view */}
            <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TaskSortHeader label="Title" sortKey="title" />
                  <TableHead>Description</TableHead>
                  <TaskSortHeader label="Assignee" sortKey="assignee" />
                  <TaskSortHeader label="Due Date" sortKey="dueDate" />
                  <TaskSortHeader label="Priority" sortKey="priority" />
                  <TaskSortHeader label="Status" sortKey="status" />
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setDrawerTask(t)}
                  >
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="max-w-[300px] whitespace-pre-wrap text-sm text-muted-foreground">
                      {t.description ? (
                        <span className="block">{t.description}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{t.assignee || "-"}</TableCell>
                    <TableCell>{t.dueDate || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={PRIORITY_COLORS[t.priority ?? ""] ?? ""}
                      >
                        {t.priority || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.status || "todo"}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setDrawerTask(null); handleEdit(t); }}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(t.id)}
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
          </CardContent>
        </Card>
      )}

      <Sheet open={!!drawerTask} onOpenChange={(o) => !o && setDrawerTask(null)}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="pr-10">{drawerTask?.title}</SheetTitle>
          </SheetHeader>
          {drawerTask && (
            <div className="flex-1 mt-6 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {drawerTask.assignee && <span>{drawerTask.assignee}</span>}
                {drawerTask.dueDate && <span>Due: {drawerTask.dueDate}</span>}
                {drawerTask.priority && (
                  <Badge
                    variant="secondary"
                    className={PRIORITY_COLORS[drawerTask.priority] ?? "bg-muted"}
                  >
                    {drawerTask.priority}
                  </Badge>
                )}
                <span>{drawerTask.status || "todo"}</span>
              </div>
              {drawerTask.description ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {drawerTask.description}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description</p>
              )}
              <Button
                variant="outline"
                className="w-full min-h-[44px]"
                onClick={() => {
                  const task = drawerTask;
                  setDrawerTask(null);
                  handleEdit(task);
                }}
              >
                Edit Task
              </Button>
              <Button
                variant="outline"
                className="w-full min-h-[44px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(drawerTask.id)}
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
            <DialogTitle>{editing ? "Edit Task" : "Add Task"}</DialogTitle>
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
              <Label>Description</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Assignee</Label>
                <Select
                  value={form.assignee ?? ""}
                  onValueChange={(v) => setForm({ ...form, assignee: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate ?? ""}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={form.priority ?? ""}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status ?? "todo"}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KANBAN_COLUMNS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
