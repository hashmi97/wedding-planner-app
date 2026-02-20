import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  StickyNote,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/activities", label: "Schedule and Appointments", icon: Calendar },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/vendors", label: "Vendors", icon: Users },
  { path: "/notes", label: "Notes", icon: StickyNote },
];

function NavLinks({
  location,
  onNavigate,
  className,
}: {
  location: ReturnType<typeof useLocation>;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex-1 p-2 space-y-0.5", className)}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-[44px]",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Layout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-[hsl(350,40%,98%)] to-[hsl(346,35%,97%)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r bg-card flex-col shrink-0">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold tracking-tight">Wedding Planner</h1>
        </div>
        <NavLinks location={location} />
      </aside>

      {/* Mobile header + main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="md:hidden sticky top-0 z-40 flex items-center gap-3 border-b bg-card px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
        >
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-10 w-10"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight truncate">
            Wedding Planner
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile nav drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <NavLinks
            location={location}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
