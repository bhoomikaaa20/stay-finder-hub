import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BedDouble } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rooms")({
  component: AdminRooms,
});

const empty = {
  hotel_id: "",
  room_type: "",
  description: "",
  price_per_night: 200,
  total_rooms: 5,
  capacity: 2,
};

function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const [r, h] = await Promise.all([
      supabase
        .from("rooms")
        .select("*, hotels(name, location)")
        .order("created_at", { ascending: false }),
      supabase.from("hotels").select("id, name").order("name"),
    ]);
    setRooms(r.data ?? []);
    setHotels(h.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...empty, hotel_id: hotels[0]?.id ?? "" });
    setOpen(true);
  };

  const startEdit = (r: any) => {
    setEditing(r);
    setForm({
      hotel_id: r.hotel_id,
      room_type: r.room_type,
      description: r.description ?? "",
      price_per_night: Number(r.price_per_night),
      total_rooms: Number(r.total_rooms),
      capacity: Number(r.capacity),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.hotel_id || !form.room_type) {
      toast.error("Hotel and room type required.");
      return;
    }
    const payload = {
      hotel_id: form.hotel_id,
      room_type: form.room_type.trim(),
      description: form.description.trim(),
      price_per_night: Number(form.price_per_night),
      total_rooms: Number(form.total_rooms),
      capacity: Number(form.capacity),
    };
    const { error } = editing
      ? await supabase.from("rooms").update(payload).eq("id", editing.id)
      : await supabase.from("rooms").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Room updated." : "Room added.");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Room deleted.");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Rooms</h2>
          <p className="text-sm text-muted-foreground">
            {rooms.length} total — pricing & availability.
          </p>
        </div>
        <Button
          onClick={startCreate}
          className="bg-gradient-vivid text-primary-foreground shadow-glow"
        >
          <Plus className="mr-1 h-4 w-4" /> Add room
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Hotel</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Rooms</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  <BedDouble className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  No rooms yet.
                </td>
              </tr>
            ) : (
              rooms.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.hotels?.name}</td>
                  <td className="px-4 py-3">{r.room_type}</td>
                  <td className="px-4 py-3 font-semibold text-gradient">
                    ${Number(r.price_per_night).toFixed(0)}
                  </td>
                  <td className="px-4 py-3">{r.capacity}</td>
                  <td className="px-4 py-3">{r.total_rooms}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => remove(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? "Edit room" : "Add room"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label>Hotel</Label>
              <Select
                value={form.hotel_id}
                onValueChange={(v) => setForm({ ...form, hotel_id: v })}
              >
                <SelectTrigger className="mt-1.5 h-11 rounded-xl">
                  <SelectValue placeholder="Pick a hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room type</Label>
              <Input
                value={form.room_type}
                onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                className="mt-1.5 h-11 rounded-xl"
                placeholder="Deluxe Suite"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5 min-h-20 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Price / night</Label>
                <Input
                  type="number"
                  value={String(form.price_per_night)}
                  onChange={(e) =>
                    setForm({ ...form, price_per_night: Number(e.target.value) })
                  }
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label>Total rooms</Label>
                <Input
                  type="number"
                  value={String(form.total_rooms)}
                  onChange={(e) =>
                    setForm({ ...form, total_rooms: Number(e.target.value) })
                  }
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={String(form.capacity)}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              className="bg-gradient-vivid text-primary-foreground shadow-glow"
            >
              {editing ? "Save changes" : "Add room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
