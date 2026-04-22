import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const [bookedRoomCounts, setBookedRoomCounts] = useState<Record<string, number>>({});

  // 🔹 SAME LOGIC — only replaced supabase
  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5000/api/hotels/${hotelId}`).then(res => res.json()),
    ]).then(([data]) => {
      setHotel(data.hotel);
      setRooms(data.rooms ?? []);
      if (data.rooms && data.rooms.length > 0) setSelectedRoomId(data.rooms[0]._id);
      setLoading(false);
    });
  }, [hotelId]);

  // 🔹 SAME LOGIC — only replaced supabase
  useEffect(() => {
    if (rooms.length === 0) return;

    fetch(`http://localhost:5000/api/bookings/counts/${hotelId}`)
      .then(res => res.json())
      .then((data) => {
        setBookedRoomCounts(data);
      });
  }, [rooms, hotelId]);

  const selectedRoom = rooms.find((r) => r._id === selectedRoomId);

  const nights =
    range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;

  const total =
    selectedRoom && nights > 0 ? Number(selectedRoom.price_per_night) * nights : 0;

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

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hotel: hotelId,
        room: selectedRoomId,
        check_in: format(range.from, "yyyy-MM-dd"),
        check_out: format(range.to, "yyyy-MM-dd"),
        guests,
        total_price: total,
        status: "confirmed",
      }),
    });

    setBooking(false);

    if (!res.ok) {
      toast.error("Booking failed");
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

          {/* ROOMS (UNCHANGED UI) */}
          <div className="mt-10">
            <h3 className="font-display text-2xl font-bold">Choose your room</h3>
            <div className="mt-4 space-y-3">
              {rooms.map((room) => {
                const booked = bookedRoomCounts[room._id] ?? 0;
                const available = Math.max(0, room.total_rooms - booked);
                const isSelected = selectedRoomId === room._id;

                return (
                  <button
                    key={room._id}
                    onClick={() => setSelectedRoomId(room._id)}
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

        {/* BOOKING CARD (UNCHANGED UI) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-elegant">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Book your stay
              </p>
            </div>

            {/* DATE PICKER */}
            <div className="mt-4 space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-14 w-full justify-start rounded-2xl">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {range?.from ? (
                      range.to ? (
                        <span>
                          {format(range.from, "MMM d")} → {format(range.to, "MMM d")}
                        </span>
                      ) : (
                        format(range.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Pick dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="range" selected={range} onSelect={setRange} />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={handleBook}
              disabled={booking || !selectedRoom || nights <= 0}
              className="mt-5 w-full"
            >
              {booking
                ? "Booking..."
                : isAuthenticated
                  ? "Confirm booking"
                  : "Sign in to book"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}