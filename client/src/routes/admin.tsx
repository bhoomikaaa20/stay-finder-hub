import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, Hotel, BedDouble, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — StayVivid" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-3xl">Sign in required.</h1>
        <Link to="/login" className="mt-6 inline-block text-primary hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center md:px-6">
        <ShieldCheck className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 font-display text-3xl font-bold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">
          You need admin privileges to access this area.
        </p>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-vivid shadow-glow">
          <ShieldCheck className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Control center
          </p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Admin</h1>
        </div>
      </div>

      <nav className="mt-8 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-soft">
        <NavTab to="/admin" icon={Hotel} label="Hotels" exact />
        <NavTab to="/admin/rooms" icon={BedDouble} label="Rooms" />
        <NavTab to="/admin/bookings" icon={Calendar} label="Bookings" />
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

function NavTab({
  to,
  icon: Icon,
  label,
  exact,
}: {
  to: string;
  icon: any;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      activeProps={{ className: "!bg-gradient-vivid !text-primary-foreground shadow-glow" }}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-smooth hover:bg-secondary",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
