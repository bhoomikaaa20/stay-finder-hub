import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HotelCard } from "@/components/HotelCard";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Globe, ShieldCheck, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StayVivid — Book unforgettable stays" },
      {
        name: "description",
        content:
          "Discover and book vibrant hotels worldwide. Real-time availability, instant confirmation.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("hotels")
      .select("*")
      .order("rating", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setHotels(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/60 to-background" />

        <div className="container mx-auto px-4 py-20 md:px-6 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Real-time availability · Instant confirmation</span>
            </div>

            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
              Stays that
              <br />
              <span className="text-gradient-sunset">feel like magic.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              From cliff-side villas in Santorini to overwater bungalows in the
              Maldives — find your next unforgettable stay in seconds.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-vivid text-primary-foreground shadow-glow transition-bounce hover:scale-105"
              >
                <Link to="/hotels">
                  <Search className="mr-1 h-4 w-4" /> Browse hotels
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/signup">Create free account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 py-20 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Globe,
              title: "200+ destinations",
              desc: "Hand-picked stays across six continents.",
              color: "text-magenta",
            },
            {
              icon: Zap,
              title: "Instant booking",
              desc: "Confirmed in seconds, no waiting around.",
              color: "text-coral",
            },
            {
              icon: ShieldCheck,
              title: "Secure & simple",
              desc: "Your data is encrypted and your stay protected.",
              color: "text-indigo",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl bg-card p-6 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary">
                <f.icon className={`h-6 w-6 ${f.color}`} />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED HOTELS */}
      <section className="container mx-auto px-4 pb-24 md:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Featured
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">
              Top-rated stays
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/hotels">View all →</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-3xl bg-secondary"
                />
              ))
            : hotels.map((h, i) => <HotelCard key={h.id} hotel={h} index={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-vivid p-10 text-center text-primary-foreground md:p-16">
          <div className="absolute inset-0 bg-mesh opacity-30" />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold md:text-6xl">
              Ready to pack your bags?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
              Join thousands of travelers booking unforgettable stays on StayVivid.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="bg-background text-foreground shadow-elegant transition-bounce hover:scale-105"
              >
                <Link to="/hotels">Start exploring</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
