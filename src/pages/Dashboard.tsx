import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useTasksStore,
  useActivitiesStore,
  useVendorsStore,
} from "@/store";
import type { Task, Activity, Vendor } from "@/api/types";
import { parseNum, calcRemaining, formatAmount, formatDayMonth } from "@/lib/utils";

function isDueSoon(dateStr: string | undefined, days = 14): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

function isOverdue(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < now.getTime();
}

const VENDOR_STATUSES = [
  { value: "shortlisted", label: "Shortlisted" },
  { value: "booked", label: "Booked" },
  { value: "rejected", label: "Rejected" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  medium: "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100",
  high: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
};

type DrawerItem = { type: "task"; item: Task } | { type: "activity"; item: Activity } | { type: "vendor"; item: Vendor };

export function Dashboard() {
  const tasks = useTasksStore();
  const activities = useActivitiesStore();
  const vendors = useVendorsStore();
  const navigate = useNavigate();
  const [drawerItem, setDrawerItem] = useState<DrawerItem | null>(null);

  useEffect(() => {
    tasks.fetch();
    activities.fetch();
    vendors.fetch();
  }, []);

  const dueSoonTasks = tasks.items.filter(
    (t) => t.status !== "done" && isDueSoon(t.dueDate)
  );
  const dueSoonActivities = activities.items.filter(
    (a) => a.date && isDueSoon(a.date)
  );
  const dueSoonVendors = vendors.items.filter(
    (v) => v.nextPaymentDate && isDueSoon(v.nextPaymentDate)
  );
  const dueSoon: (DrawerItem & { date?: string; typeLabel: string })[] = [
    ...dueSoonTasks.map((t) => ({
      type: "task" as const,
      item: t,
      date: t.dueDate,
      typeLabel: "task",
    })),
    ...dueSoonActivities.map((a) => ({
      type: "activity" as const,
      item: a,
      date: a.date,
      typeLabel: "appointment",
    })),
    ...dueSoonVendors.map((v) => ({
      type: "vendor" as const,
      item: v,
      date: v.nextPaymentDate!,
      typeLabel: "vendor payment",
    })),
  ].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : Infinity;
    const db = b.date ? new Date(b.date).getTime() : Infinity;
    return da - db;
  });

  const overdueTasks = tasks.items.filter(
    (t) => (t.status === "todo" || t.status === "doing") && isOverdue(t.dueDate)
  );
  const overdue = [...overdueTasks].sort((a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return da - db;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your wedding planning progress
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.items.length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.items.filter((t) => t.status !== "done").length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Schedule and Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.items.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.items.length}</div>
            <p className="text-xs text-muted-foreground">Total vendors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Due Soon</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tasks, appointments, and vendor payments in the next 14 days
            </p>
          </CardHeader>
          <CardContent>
            {dueSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing due in the next 14 days
              </p>
            ) : (
              <ul className="space-y-2">
                {dueSoon.slice(0, 10).map((item) => (
                  <li
                    key={`${item.type}-${item.item.id}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setDrawerItem(item)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.type === "vendor" ? `${item.item.name} – payment due` : item.item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date} · {item.typeLabel}
                      </p>
                    </div>
                    <span className="text-sm text-primary font-medium shrink-0">View</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tasks not yet done with a due date before today
            </p>
          </CardHeader>
          <CardContent>
            {overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No overdue tasks
              </p>
            ) : (
              <ul className="space-y-2">
                {overdue.slice(0, 10).map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setDrawerItem({ type: "task", item: task })}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.dueDate} · {task.status}
                      </p>
                    </div>
                    <span className="text-sm text-primary font-medium shrink-0">View</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add new items quickly
          </p>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <Button asChild className="min-h-[44px] w-full sm:w-auto">
            <Link to="/tasks">Add Task</Link>
          </Button>
          <Button variant="outline" asChild className="min-h-[44px] w-full sm:w-auto">
            <Link to="/activities">Add Appointment</Link>
          </Button>
          <Button variant="outline" asChild className="min-h-[44px] w-full sm:w-auto">
            <Link to="/vendors">Add Vendor</Link>
          </Button>
          <Button variant="outline" asChild className="min-h-[44px] w-full sm:w-auto">
            <Link to="/notes">Add Note</Link>
          </Button>
        </CardContent>
      </Card>

      <Sheet open={!!drawerItem} onOpenChange={(o) => !o && setDrawerItem(null)}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="pr-10">
              {drawerItem?.type === "task" && drawerItem.item.title}
              {drawerItem?.type === "activity" && drawerItem.item.title}
              {drawerItem?.type === "vendor" && drawerItem.item.name}
            </SheetTitle>
          </SheetHeader>
          {drawerItem && (
            <div className="flex-1 mt-6 space-y-4 overflow-y-auto">
              {drawerItem.type === "task" && (
                <>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {drawerItem.item.assignee && <span>{drawerItem.item.assignee}</span>}
                    {drawerItem.item.dueDate && <span>Due: {drawerItem.item.dueDate}</span>}
                    {drawerItem.item.priority && (
                      <Badge
                        variant="secondary"
                        className={PRIORITY_COLORS[drawerItem.item.priority] ?? "bg-muted"}
                      >
                        {drawerItem.item.priority}
                      </Badge>
                    )}
                    <span>{drawerItem.item.status || "todo"}</span>
                  </div>
                  {drawerItem.item.description ? (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {drawerItem.item.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description</p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px]"
                    onClick={() => {
                      setDrawerItem(null);
                      navigate("/tasks", { state: { editId: drawerItem.item.id } });
                    }}
                  >
                    Edit
                  </Button>
                </>
              )}
              {drawerItem.type === "activity" && (
                <>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {drawerItem.item.date && <span>Date: {drawerItem.item.date}</span>}
                    {(drawerItem.item.startTime || drawerItem.item.endTime) && (
                      <span>
                        Time: {drawerItem.item.startTime && drawerItem.item.endTime
                          ? `${drawerItem.item.startTime} – ${drawerItem.item.endTime}`
                          : drawerItem.item.startTime || drawerItem.item.endTime}
                      </span>
                    )}
                  </div>
                  {drawerItem.item.location && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                      <p className="text-sm text-foreground">{drawerItem.item.location}</p>
                    </div>
                  )}
                  {drawerItem.item.notes ? (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {drawerItem.item.notes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No notes</p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px]"
                    onClick={() => {
                      setDrawerItem(null);
                      navigate("/activities", { state: { editId: drawerItem.item.id } });
                    }}
                  >
                    Edit
                  </Button>
                </>
              )}
              {drawerItem.type === "vendor" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p>{drawerItem.item.category || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Next Payment Date</p>
                    <p>{formatDayMonth(drawerItem.item.nextPaymentDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quoted Price</p>
                    <p>{formatAmount(drawerItem.item.quotedPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                    <p>{formatAmount(drawerItem.item.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                    <p>
                      {(parseNum(drawerItem.item.quotedPrice) > 0 || parseNum(drawerItem.item.amountPaid) > 0)
                        ? formatAmount(calcRemaining(drawerItem.item.quotedPrice, drawerItem.item.amountPaid))
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p>{VENDOR_STATUSES.find((s) => s.value === drawerItem.item.status)?.label || drawerItem.item.status || "-"}</p>
                  </div>
                  {drawerItem.item.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="whitespace-pre-wrap text-sm">{drawerItem.item.notes}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px]"
                    onClick={() => {
                      setDrawerItem(null);
                      navigate("/vendors", { state: { editId: drawerItem.item.id } });
                    }}
                  >
                    Edit
                  </Button>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
