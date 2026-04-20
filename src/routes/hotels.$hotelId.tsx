import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { resolveImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Star, Users, ArrowLeft, Sparkles } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

export const Route = createFileRoute("/hotels/$hotelId")({
  component: HotelDetail,
});

function HotelDetail() {
  const { hotelId } = Route.useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [booking, setBooking] = useState(false);
  const [bookedRoomCounts, setBookedRoomCounts] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    Promise.all([
      supabase.from("hotels").select("*").eq("id", hotelId).maybeSingle(),
      supabase.from("rooms").select("*").eq("hotel_id", hotelId).order("price_per_night"),
    ]).then(([h, r]) => {
      setHotel(h.data);
      setRooms(r.data ?? []);
      if (r.data && r.data.length > 0) setSelectedRoomId(r.data[0].id);
      setLoading(false);
    });
  }, [hotelId]);

  // Count active bookings per room overlapping today onwards (simple availability hint)
  useEffect(() => {
    if (rooms.length === 0) return;
    supabase
      .from("bookings")
      .select("room_id")
      .in(
        "room_id",
        rooms.map((r) => r.id),
      )
      .neq("status", "cancelled")
      .gte("check_out", new Date().toISOString().slice(0, 10))
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        (data ?? []).forEach((b) => {
          counts[b.room_id] = (counts[b.room_id] ?? 0) + 1;
        });
        setBookedRoomCounts(counts);
      });
  }, [rooms]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const nights =
    range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const total = selectedRoom && nights > 0 ? Number(selectedRoom.price_per_night) * nights : 0;

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to book.");
      router.navigate({ to: "/login", search: { redirect: `/hotels/${hotelId}` } });
      return;
    }
    if (!selectedRoom || !range?.from || !range?.to || nights <= 0) {
      toast.error("Please select a room and valid dates.");
      return;
    }

    setBooking(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user!.id,
      room_id: selectedRoom.id,
      hotel_id: hotelId,
      check_in: format(range.from, "yyyy-MM-dd"),
      check_out: format(range.to, "yyyy-MM-dd"),
      guests,
      total_price: total,
      status: "confirmed",
    });
    setBooking(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Booking confirmed! 🎉");
    router.navigate({ to: "/bookings" });
  };

  if (loading) {
    return (
      <div className="container mx-auto animate-pulse px-4 py-12 md:px-6">
        <div className="h-96 rounded-3xl bg-secondary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-3xl">Hotel not found.</h1>
        <Button asChild className="mt-6">
          <Link to="/hotels">Back to hotels</Link>
        </Button>
      </div>
    );
  }

  const amenities = Array.isArray(hotel.amenities) ? (hotel.amenities as string[]) : [];

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <Link
        to="/hotels"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All hotels
      </Link>

      {/* HERO IMAGE */}
      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-3xl shadow-elegant md:aspect-[21/9]">
        <img
          src={resolveImage(hotel.image_url)}
          alt={hotel.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs font-bold backdrop-blur w-fit">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {Number(hotel.rating).toFixed(1)} · Top rated
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-6xl">
            {hotel.name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-white/90">
            <MapPin className="h-4 w-4" />
            {hotel.location}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* LEFT COL */}
        <div>
          <h2 className="font-display text-2xl font-bold">About this stay</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{hotel.description}</p>

          {amenities.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold">Amenities</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <h3 className="font-display text-2xl font-bold">Choose your room</h3>
            <div className="mt-4 space-y-3">
              {rooms.map((room) => {
                const booked = bookedRoomCounts[room.id] ?? 0;
                const available = Math.max(0, room.total_rooms - booked);
                const isSelected = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    disabled={available === 0}
                    className={cn(
                      "block w-full rounded-2xl border-2 p-5 text-left transition-smooth",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-card"
                        : "border-border bg-card hover:border-primary/40",
                      available === 0 && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-lg font-bold">{room.room_type}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {room.description}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> Up to {room.capacity}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 font-semibold",
                              available > 0
                                ? "bg-green-500/15 text-green-700 dark:text-green-400"
                                : "bg-destructive/15 text-destructive",
                            )}
                          >
                            {available > 0 ? `${available} available` : "Sold out"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-gradient">
                          ${Number(room.price_per_night).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">/night</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOOKING CARD */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-elegant">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Book your stay
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-14 w-full justify-start rounded-2xl border-border text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {range?.from ? (
                      range.to ? (
                        <span>
                          {format(range.from, "MMM d")} → {format(range.to, "MMM d")}
                        </span>
                      ) : (
                        format(range.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span className="text-muted-foreground">Pick check-in & check-out</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    numberOfMonths={1}
                    disabled={{ before: new Date() }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
                <div>
                  <p className="text-sm font-semibold">Guests</p>
                  <p className="text-xs text-muted-foreground">
                    Max {selectedRoom?.capacity ?? 4}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center font-bold">{guests}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() =>
                      setGuests(Math.min(selectedRoom?.capacity ?? 4, guests + 1))
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {nights > 0 && selectedRoom && (
              <div className="mt-5 space-y-2 border-t border-border pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${Number(selectedRoom.price_per_night).toFixed(0)} × {nights} night
                    {nights > 1 ? "s" : ""}
                  </span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-3xl font-bold text-gradient">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleBook}
              disabled={booking || !selectedRoom || nights <= 0}
              size="lg"
              className="mt-5 h-14 w-full rounded-2xl bg-gradient-vivid text-base font-bold text-primary-foreground shadow-glow transition-bounce hover:scale-[1.02]"
            >
              {booking ? "Booking..." : isAuthenticated ? "Confirm booking" : "Sign in to book"}
            </Button>

            {!isAuthenticated && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You'll be redirected to sign in first.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
