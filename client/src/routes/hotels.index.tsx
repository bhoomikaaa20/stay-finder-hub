import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HotelCard } from "@/components/HotelCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/hotels/")({
  head: () => ({
    meta: [
      { title: "Browse Hotels — StayVivid" },
      {
        name: "description",
        content: "Browse our hand-picked selection of vibrant hotels worldwide.",
      },
    ],
  }),
  component: HotelsPage,
});

function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // 🔹 ONLY CHANGE: supabase → fetch
  useEffect(() => {
    fetch("http://localhost:5000/api/hotels")
      .then((res) => res.json())
      .then((data) => {
        setHotels(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hotels;
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q),
    );
  }, [hotels, query]);

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            All stays
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-6xl">
            Find your <span className="text-gradient">next escape</span>
          </h1>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 rounded-2xl border-border bg-card pl-10 shadow-soft"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-3xl bg-secondary"
            />
          ))
        ) : filtered.length === 0 ? (
          <p className="col-span-full py-20 text-center text-muted-foreground">
            No hotels match your search.
          </p>
        ) : (
          filtered.map((h, i) => (
            <HotelCard key={h._id} hotel={h} index={i} />
          ))
        )}
      </div>
    </div>
  );
}