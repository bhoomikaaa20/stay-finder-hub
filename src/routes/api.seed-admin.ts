import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// One-time endpoint: creates a demo admin (admin@demo.com / admin123) if no admin exists yet.
// Hit GET /api/seed-admin once; after an admin exists, calls become no-ops.
export const Route = createFileRoute("/api/seed-admin")({
  server: {
    handlers: {
      GET: async () => {
        // Check if any admin already exists
        const { data: existingAdmins, error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("role", "admin")
          .limit(1);

        if (roleErr) {
          return Response.json({ ok: false, error: roleErr.message }, { status: 500 });
        }

        if (existingAdmins && existingAdmins.length > 0) {
          return Response.json({ ok: true, message: "Admin already exists." });
        }

        const email = "admin@demo.com";
        const password = "admin123";

        // Create the user via admin API (auto-confirmed, no email verification)
        const { data: created, error: createErr } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: "Demo Admin" },
          });

        let userId = created?.user?.id;

        if (createErr || !userId) {
          // Maybe user already exists — look it up
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const found = list?.users.find((u) => u.email === email);
          if (!found) {
            return Response.json(
              { ok: false, error: createErr?.message ?? "Failed to create admin" },
              { status: 500 },
            );
          }
          userId = found.id;
        }

        // Insert admin role
        const { error: insertErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

        if (insertErr) {
          return Response.json({ ok: false, error: insertErr.message }, { status: 500 });
        }

        return Response.json({
          ok: true,
          message: "Demo admin created.",
          credentials: { email, password },
        });
      },
    },
  },
});
