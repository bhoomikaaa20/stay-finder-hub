import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;

function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/admin/bookings");
    const data = await res.json();

    setBookings(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`http://localhost:5000/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    toast.success("Status updated.");
    load();
  };

  return (
    <div>
      <div>
        <h2 className="font-display text-2xl font-bold">All bookings</h2>
        <p className="text-sm text-muted-foreground">
          {bookings.length} total — manage reservations.
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />
          ))
        ) : bookings.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
            No bookings yet.
          </p>
        ) : (
          bookings.map((b) => (
            <div
              key={b._id}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-card"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg font-bold">{b.hotel?.name}</h3>
                    <StatusPill status={b.status} />
                  </div>

                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {b.hotel?.location} · {b.room?.room_type}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(parseISO(b.check_in), "MMM d")} →{" "}
                      {format(parseISO(b.check_out), "MMM d, yyyy")}
                    </span>

                    <span className="rounded-full bg-secondary px-3 py-1">
                      {b.guests} guest{b.guests > 1 ? "s" : ""}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      Booked by{" "}
                      <span className="font-semibold text-foreground">
                        {b.user?.name ?? b.user?.email ?? "Unknown"}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="font-display text-2xl font-bold text-gradient">
                    ${Number(b.total_price).toFixed(2)}
                  </p>

                  <Select
                    value={b.status}
                    onValueChange={(v) => updateStatus(b._id, v)}
                  >
                    <SelectTrigger className="h-10 w-36 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-500/15 text-green-700",
    pending: "bg-gold/20 text-foreground",
    cancelled: "bg-destructive/15 text-destructive",
    completed: "bg-secondary",
  };

  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", styles[status])}>
      {status}
    </span>
  );
}