import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import { useVendorsStore } from "@/store";
import type { Vendor } from "@/api/types";
import { parseNum, calcRemaining, formatAmount, formatDayMonth } from "@/lib/utils";

const VENDOR_STATUSES = [
  { value: "shortlisted", label: "Shortlisted" },
  { value: "booked", label: "Booked" },
  { value: "rejected", label: "Rejected" },
] as const;

const STATUS_FILTER_ALL = "all";
const CATEGORY_FILTER_ALL = "all";

export function Vendors() {
  const store = useVendorsStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [drawerVendor, setDrawerVendor] = useState<Vendor | null>(null);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Partial<Vendor>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_ALL);
  const [categoryFilter, setCategoryFilter] = useState(CATEGORY_FILTER_ALL);
  type VendorSortKey = "name" | "category" | "status" | "quotedPrice" | "amountPaid" | "remaining" | "nextPaymentDate";
  const [vendorSortKey, setVendorSortKey] = useState<VendorSortKey>("name");
  const [vendorSortAsc, setVendorSortAsc] = useState(true);

  const sortedVendors = useMemo(() => {
    const items = [...store.items];
    items.sort((a, b) => {
      let cmp = 0;
      if (vendorSortKey === "name") cmp = (a.name ?? "").localeCompare(b.name ?? "");
      else if (vendorSortKey === "category") cmp = (a.category ?? "").localeCompare(b.category ?? "");
      else if (vendorSortKey === "status") cmp = (a.status ?? "").localeCompare(b.status ?? "");
      else if (vendorSortKey === "quotedPrice") cmp = parseNum(a.quotedPrice) - parseNum(b.quotedPrice);
      else if (vendorSortKey === "amountPaid") cmp = parseNum(a.amountPaid) - parseNum(b.amountPaid);
      else if (vendorSortKey === "remaining") cmp = calcRemaining(a.quotedPrice, a.amountPaid) - calcRemaining(b.quotedPrice, b.amountPaid);
      else if (vendorSortKey === "nextPaymentDate") {
        const da = a.nextPaymentDate ? new Date(a.nextPaymentDate).getTime() : 0;
        const db = b.nextPaymentDate ? new Date(b.nextPaymentDate).getTime() : 0;
        cmp = da - db;
      }
      return vendorSortAsc ? cmp : -cmp;
    });
    return items;
  }, [store.items, vendorSortKey, vendorSortAsc]);

  const handleVendorSort = (key: VendorSortKey) => {
    if (vendorSortKey === key) setVendorSortAsc((prev) => !prev);
    else {
      setVendorSortKey(key);
      setVendorSortAsc(true);
    }
  };

  const VendorSortHeader = ({ label, sortKey: k }: { label: string; sortKey: VendorSortKey }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleVendorSort(k)}
    >
      <div className="flex items-center gap-1">
        {label}
        {vendorSortKey === k ? (vendorSortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : null}
      </div>
    </TableHead>
  );

  const availableCategories = (categoryFilter !== CATEGORY_FILTER_ALL
    ? [categoryFilter]
    : [...new Set(store.items.map((v) => v.category).filter(Boolean))].sort() as string[]
  );

  useEffect(() => {
    store.fetch({
      search: search || undefined,
      status: statusFilter === STATUS_FILTER_ALL ? undefined : statusFilter,
      category: categoryFilter === CATEGORY_FILTER_ALL ? undefined : categoryFilter,
    });
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    const editId = (location.state as { editId?: string } | null)?.editId;
    if (editId && store.items.length > 0) {
      const vendor = store.items.find((v) => v.id === editId);
      if (vendor) {
        handleEdit(vendor);
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

  const handleEdit = (v: Vendor) => {
    setEditing(v);
    setForm({ ...v });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this vendor?")) await store.remove(id);
    setDrawerVendor(null);
  };

  const SORT_OPTIONS: { value: VendorSortKey; label: string }[] = [
    { value: "name", label: "Name" },
    { value: "category", label: "Category" },
    { value: "status", label: "Status" },
    { value: "quotedPrice", label: "Quoted Price" },
    { value: "amountPaid", label: "Amount Paid" },
    { value: "remaining", label: "Remaining" },
    { value: "nextPaymentDate", label: "Next Payment" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">Manage wedding vendors</p>
        </div>
        <Button
          className="w-full sm:w-auto min-h-[44px] sm:min-h-0"
          onClick={() => { setEditing(null); setForm({ status: "shortlisted" }); setOpen(true); }}
        >
          Add Vendor
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <Label>Search</Label>
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={STATUS_FILTER_ALL}>All statuses</SelectItem>
                  {VENDOR_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[180px]">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CATEGORY_FILTER_ALL}>All categories</SelectItem>
                  {availableCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile sort dropdown */}
          <div className="sm:hidden mb-4">
            <Label>Sort by</Label>
            <Select
              value={vendorSortKey}
              onValueChange={(v) => {
                setVendorSortKey(v as VendorSortKey);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label} {vendorSortAsc ? "↑" : "↓"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1"
              onClick={() => setVendorSortAsc((p) => !p)}
            >
              {vendorSortAsc ? "Ascending" : "Descending"}
            </Button>
          </div>

          {store.error && (
            <div className="text-destructive text-sm mb-4">{store.error}</div>
          )}

          {store.loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="sm:hidden space-y-2">
                {sortedVendors.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px] flex flex-col gap-2"
                    onClick={() => setDrawerVendor(v)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium">{v.name}</p>
                      <Badge variant="secondary">
                        {VENDOR_STATUSES.find((s) => s.value === v.status)?.label || v.status || "-"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {v.category && <span>{v.category}</span>}
                      <span>Quoted: {formatAmount(v.quotedPrice)}</span>
                      <span>Paid: {formatAmount(v.amountPaid)}</span>
                      {(parseNum(v.quotedPrice) > 0 || parseNum(v.amountPaid) > 0) && (
                        <span>Remaining: {formatAmount(calcRemaining(v.quotedPrice, v.amountPaid))}</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => handleEdit(v)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive min-h-[44px]"
                        onClick={() => handleDelete(v.id)}
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
                  <VendorSortHeader label="Name" sortKey="name" />
                  <VendorSortHeader label="Category" sortKey="category" />
                  <VendorSortHeader label="Status" sortKey="status" />
                  <VendorSortHeader label="Quoted Price" sortKey="quotedPrice" />
                  <VendorSortHeader label="Amount Paid" sortKey="amountPaid" />
                  <VendorSortHeader label="Remaining" sortKey="remaining" />
                  <VendorSortHeader label="Next Payment" sortKey="nextPaymentDate" />
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVendors.map((v) => (
                  <TableRow
                    key={v.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setDrawerVendor(v)}
                  >
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.category || "-"}</TableCell>
                    <TableCell>
                      {VENDOR_STATUSES.find((s) => s.value === v.status)?.label || v.status || "-"}
                    </TableCell>
                    <TableCell>{formatAmount(v.quotedPrice)}</TableCell>
                    <TableCell>{formatAmount(v.amountPaid)}</TableCell>
                    <TableCell>
                      {(parseNum(v.quotedPrice) > 0 || parseNum(v.amountPaid) > 0)
                        ? formatAmount(calcRemaining(v.quotedPrice, v.amountPaid))
                        : "-"}
                    </TableCell>
                    <TableCell>{formatDayMonth(v.nextPaymentDate)}</TableCell>
                    <TableCell className="max-w-[300px] whitespace-pre-wrap text-sm text-muted-foreground">
                      {v.notes ? (
                        <span className="block">{v.notes}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(v)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(v.id)}
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

      <Sheet open={!!drawerVendor} onOpenChange={(o) => !o && setDrawerVendor(null)}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="pr-10">{drawerVendor?.name}</SheetTitle>
          </SheetHeader>
          {drawerVendor && (
            <div className="space-y-4 mt-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p>{drawerVendor.category || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact</p>
                <p>{drawerVendor.contactName || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{drawerVendor.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{drawerVendor.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instagram</p>
                {drawerVendor.instagram ? (
                  <a
                    href={`https://www.instagram.com/${drawerVendor.instagram.replace(/^@/, "")}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @{drawerVendor.instagram.replace(/^@/, "")}
                  </a>
                ) : (
                  <p>-</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <a
                  href={drawerVendor.website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {drawerVendor.website || "-"}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quoted Price</p>
                <p>{formatAmount(drawerVendor.quotedPrice)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                <p>{formatAmount(drawerVendor.amountPaid)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining Amount</p>
                <p>
                  {(parseNum(drawerVendor.quotedPrice) > 0 || parseNum(drawerVendor.amountPaid) > 0)
                    ? formatAmount(calcRemaining(drawerVendor.quotedPrice, drawerVendor.amountPaid))
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Payment Date</p>
                <p>{formatDayMonth(drawerVendor.nextPaymentDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p>{VENDOR_STATUSES.find((s) => s.value === drawerVendor.status)?.label || drawerVendor.status || "-"}</p>
              </div>
              {drawerVendor.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap text-sm">{drawerVendor.notes}</p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const v = drawerVendor;
                  setDrawerVendor(null);
                  handleEdit(v);
                }}
              >
                Edit Vendor
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name ?? ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={form.category ?? ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={form.contactName ?? ""}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status ?? "shortlisted"}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Instagram</Label>
                <Input
                  value={form.instagram ?? ""}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="Username (e.g. johndoe)"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={form.website ?? ""}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div>
                <Label>Quoted Price</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={form.quotedPrice ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, quotedPrice: val === "" ? undefined : val });
                  }}
                />
              </div>
              <div>
                <Label>Amount Paid</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={form.amountPaid ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, amountPaid: val === "" ? undefined : val });
                  }}
                />
              </div>
              <div>
                <Label>Remaining Amount</Label>
                <p className="text-sm text-muted-foreground py-2">
                  {(parseNum(form.quotedPrice) > 0 || parseNum(form.amountPaid) > 0)
                    ? formatAmount(calcRemaining(form.quotedPrice, form.amountPaid))
                    : "-"}
                </p>
              </div>
              <div>
                <Label>Next Payment Date</Label>
                <Input
                  type="date"
                  value={form.nextPaymentDate ?? ""}
                  onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value || undefined })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes about this vendor"
                  rows={4}
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
