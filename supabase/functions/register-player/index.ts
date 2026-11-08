import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  const respond = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "POST method required" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return respond({ error: "Server configuration missing" }, 500);

    const db = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const ign = String(body.ign ?? "").trim();
    const uid = String(body.uid ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const tier = String(body.tier ?? "");
    const note = String(body.note ?? "").trim();
    const consent = body.consent === true;
    const avatarId = Number(body.avatar_id);

    if (!ign || ign.length > 40) return respond({ error: "Invalid player name" }, 400);
    if (!/^[0-9]{3,24}$/.test(uid)) return respond({ error: "Invalid Free Fire UID" }, 400);
    if (!/^[0-9+() -]{7,20}$/.test(phone)) return respond({ error: "Invalid contact number" }, 400);
    if (!["Tier 1", "Tier 2", "Tier 3"].includes(tier)) return respond({ error: "Invalid tier" }, 400);
    if (note.length > 250 || !consent) return respond({ error: "Consent is required" }, 400);
    if (!Number.isInteger(avatarId) || avatarId < 1 || avatarId > 64) {
      return respond({ error: "Choose one of the 64 available avatars." }, 400);
    }

    const { data: avatar, error: avatarError } = await db
      .from("avatar_catalog")
      .select("id")
      .eq("id", avatarId)
      .eq("active", true)
      .maybeSingle();
    if (avatarError) throw avatarError;
    if (!avatar) return respond({ error: "That avatar is unavailable. Choose another." }, 400);

    const { data: tournaments, error: tournamentError } = await db
      .from("tournaments")
      .select("id")
      .eq("registration_open", true)
      .limit(2);
    if (tournamentError) throw tournamentError;
    if (!tournaments?.length) return respond({ error: "Registration is currently closed." }, 409);
    if (tournaments.length > 1) return respond({ error: "Multiple open tournaments. Contact organizer." }, 409);

    const { data, error } = await db.from("registrations").insert({
      tournament_id: tournaments[0].id,
      ign,
      player_uid: uid,
      contact_number: phone,
      tier,
      note: note || null,
      consent: true,
      avatar_id: avatarId,
    }).select("id, registration_token").single();

    if (error) {
      if (error.code === "23505") return respond({ error: "This player UID is already registered." }, 409);
      throw error;
    }

    return respond({
      success: true,
      message: "Registration successful!",
      token: data.registration_token,
      registration_id: data.id,
      avatar_id: avatarId,
      payment_status: "Not collected",
    }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return respond({ error: "Registration failed. Please try again." }, 500);
  }
});
