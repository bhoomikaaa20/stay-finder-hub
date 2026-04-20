import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { resolveImage } from "@/lib/images";

interface Hotel {
  id: string;
  name: string;
  location: string;
  image_url: string | null;
  price_min: number;
  price_max: number;
  rating: number;
  amenities: unknown;
}

export function HotelCard({ hotel, index = 0 }: { hotel: Hotel; index?: number }) {
  const amenities = Array.isArray(hotel.amenities) ? (hotel.amenities as string[]) : [];

  return (
    <Link
      to="/hotels/$hotelId"
      params={{ hotelId: hotel.id }}
      className="group block overflow-hidden rounded-3xl bg-card shadow-card transition-bounce hover:-translate-y-1 hover:shadow-elegant"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={resolveImage(hotel.image_url)}
          alt={hotel.name}
          loading={index < 2 ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-bounce group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold backdrop-blur">
          <Star className="h-3 w-3 fill-gold text-gold" />
          {Number(hotel.rating).toFixed(1)}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl font-bold leading-tight">{hotel.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {hotel.location}
        </p>

        {amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between border-t border-border/50 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-display text-2xl font-bold text-gradient">
              ${Number(hotel.price_min).toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground">/night</span>
            </p>
          </div>
          <span className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition-smooth group-hover:bg-gradient-vivid">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
