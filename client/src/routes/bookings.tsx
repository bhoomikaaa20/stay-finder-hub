import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { resolveImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Sparkles, Ticket } from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "My Bookings — StayVivid" }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    const res = await fetch("http://localhost:5000/api/bookings/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setBookings(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated]);

  const cancel = async (id: string) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/bookings/${id}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      toast.error("Cancel failed");
      return;
    }

    toast.success("Booking cancelled.");
    fetchBookings();
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center md:px-6">
        <Sparkles className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 font-display text-3xl font-bold">Sign in to see your trips</h1>
        <Button
          asChild
          className="mt-6 bg-gradient-vivid text-primary-foreground shadow-glow"
        >
          <Link to="/login" search={{ redirect: "/bookings" }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  const today = new Date();

  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && isAfter(parseISO(b.check_out), today),
  );

  const past = bookings.filter(
    (b) => b.status === "cancelled" || !isAfter(parseISO(b.check_out), today),
  );

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        Your trips
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">My Bookings</h1>

      {loading ? (
        <div className="mt-10 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-3xl bg-secondary" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-12 rounded-3xl border-2 border-dashed border-border p-12 text-center">
          <Ticket className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-semibold">No bookings yet</h2>
          <p className="mt-1 text-muted-foreground">
            Start exploring and book your first stay.
          </p>
          <Button
            asChild
            className="mt-6 bg-gradient-vivid text-primary-foreground shadow-glow"
          >
            <Link to="/hotels">Browse hotels</Link>
          </Button>
        </div>
      ) : (
        <>
          <Section title="Upcoming" items={upcoming} onCancel={cancel} />
          <Section title="History" items={past} onCancel={cancel} historic />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  onCancel,
  historic = false,
}: {
  title: string;
  items: any[];
  onCancel: (id: string) => void;
  historic?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="font-display text-2xl font-bold">{title}</h2>

      <div className="mt-4 space-y-4">
        {items.map((b) => (
          <div
            key={b._id}
            className={cn(
              "flex flex-col gap-4 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card md:flex-row",
              historic && "opacity-80",
            )}
          >
            <div className="relative aspect-[16/10] w-full md:aspect-auto md:w-56 md:flex-shrink-0">
              <img
                src={resolveImage(b.hotel?.image_url)}
                alt={b.hotel?.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold">
                      {b.hotel?.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {b.hotel?.location}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {format(parseISO(b.check_in), "MMM d")} →{" "}
                    {format(parseISO(b.check_out), "MMM d, yyyy")}
                  </span>

                  <span className="rounded-full bg-secondary px-3 py-1 font-medium">
                    {b.room?.room_type}
                  </span>

                  <span className="rounded-full bg-secondary px-3 py-1">
                    {b.guests} guest{b.guests > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total paid</p>
                  <p className="font-display text-2xl font-bold text-gradient">
                    ${Number(b.total_price).toFixed(2)}
                  </p>
                </div>

                {!historic && b.status !== "cancelled" && (
                  <Button variant="outline" size="sm" onClick={() => onCancel(b._id)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-500/15 text-green-700 dark:text-green-400",
    pending: "bg-gold/20 text-gold-foreground",
    cancelled: "bg-destructive/15 text-destructive",
    completed: "bg-secondary text-secondary-foreground",
  };

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
        styles[status] ?? "bg-secondary",
      )}
    >
      {status}
    </span>
  );
}