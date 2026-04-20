import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { resolveImage } from "@/lib/images";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminHotels,
});

const empty = {
  name: "",
  location: "",
  description: "",
  image_url: "",
  price_min: 100,
  price_max: 500,
  rating: 4.5,
  amenities: "",
};

function AdminHotels() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("hotels").select("*").order("created_at", {
      ascending: false,
    });
    setHotels(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (h: any) => {
    setEditing(h);
    setForm({
      name: h.name,
      location: h.location,
      description: h.description ?? "",
      image_url: h.image_url ?? "",
      price_min: Number(h.price_min),
      price_max: Number(h.price_max),
      rating: Number(h.rating),
      amenities: Array.isArray(h.amenities) ? h.amenities.join(", ") : "",
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim() || null,
      price_min: Number(form.price_min),
      price_max: Number(form.price_max),
      rating: Math.min(5, Math.max(0, Number(form.rating))),
      amenities: form.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (!payload.name || !payload.location) {
      toast.error("Name and location are required.");
      return;
    }

    const { error } = editing
      ? await supabase.from("hotels").update(payload).eq("id", editing.id)
      : await supabase.from("hotels").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Hotel updated." : "Hotel added.");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this hotel and all its rooms?")) return;
    const { error } = await supabase.from("hotels").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Hotel deleted.");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Hotels</h2>
          <p className="text-sm text-muted-foreground">
            {hotels.length} total — manage your catalog.
          </p>
        </div>
        <Button
          onClick={startCreate}
          className="bg-gradient-vivid text-primary-foreground shadow-glow"
        >
          <Plus className="mr-1 h-4 w-4" /> Add hotel
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-secondary" />
        ) : (
          hotels.map((h) => (
            <div
              key={h.id}
              className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card md:flex-row"
            >
              <img
                src={resolveImage(h.image_url)}
                alt={h.name}
                className="h-40 w-full object-cover md:h-auto md:w-48"
              />
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">{h.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {h.location}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-1 text-xs font-bold">
                      <Star className="h-3 w-3 fill-current" />
                      {Number(h.rating).toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {h.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    ${Number(h.price_min).toFixed(0)} – $
                    {Number(h.price_max).toFixed(0)} / night
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(h)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => remove(h.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? "Edit hotel" : "Add hotel"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Field
              label="Location"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
            />
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5 min-h-24 rounded-xl"
              />
            </div>
            <Field
              label="Image URL (or path)"
              value={form.image_url}
              onChange={(v) => setForm({ ...form, image_url: v })}
              placeholder="https://... or /src/assets/hotel-azure.jpg"
            />
            <div className="grid grid-cols-3 gap-3">
              <Field
                label="Min price"
                type="number"
                value={String(form.price_min)}
                onChange={(v) => setForm({ ...form, price_min: Number(v) })}
              />
              <Field
                label="Max price"
                type="number"
                value={String(form.price_max)}
                onChange={(v) => setForm({ ...form, price_max: Number(v) })}
              />
              <Field
                label="Rating (0–5)"
                type="number"
                value={String(form.rating)}
                onChange={(v) => setForm({ ...form, rating: Number(v) })}
              />
            </div>
            <Field
              label="Amenities (comma-separated)"
              value={form.amenities}
              onChange={(v) => setForm({ ...form, amenities: v })}
              placeholder="Pool, Spa, Free WiFi"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              className="bg-gradient-vivid text-primary-foreground shadow-glow"
            >
              {editing ? "Save changes" : "Add hotel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 rounded-xl"
      />
    </div>
  );
}
