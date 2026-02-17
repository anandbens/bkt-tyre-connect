import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEST_OTP = "1234";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { phone, otp, action } = await req.json();

    if (action === "send") {
      // Validate phone exists in dealers table
      if (!phone) {
        return new Response(JSON.stringify({ error: "Phone number is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: dealer } = await supabase
        .from("dealers")
        .select("dealer_code, dealer_name, dealer_status")
        .eq("dealer_mobile_number", phone)
        .maybeSingle();

      if (!dealer) {
        return new Response(JSON.stringify({ error: "No dealer found with this mobile number" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (dealer.dealer_status !== "ACTIVE") {
        return new Response(JSON.stringify({ error: "This dealer account is inactive" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if a user account is linked to this dealer
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("dealer_code", dealer.dealer_code)
        .eq("role", "dealer")
        .maybeSingle();

      if (!userRole) {
        return new Response(JSON.stringify({ error: "No login account linked to this dealer. Please contact admin." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // In production, send real SMS here. For now, test OTP is 1234.
      return new Response(JSON.stringify({ success: true, message: "OTP sent (test: 1234)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      if (!phone || !otp) {
        return new Response(JSON.stringify({ error: "Phone and OTP are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify OTP (hardcoded for testing)
      if (otp !== TEST_OTP) {
        return new Response(JSON.stringify({ error: "Invalid OTP" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Look up dealer by phone
      const { data: dealer } = await supabase
        .from("dealers")
        .select("dealer_code")
        .eq("dealer_mobile_number", phone)
        .maybeSingle();

      if (!dealer) {
        return new Response(JSON.stringify({ error: "Dealer not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find linked user
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("dealer_code", dealer.dealer_code)
        .eq("role", "dealer")
        .maybeSingle();

      if (!userRole) {
        return new Response(JSON.stringify({ error: "No account linked to this dealer" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get user email from auth
      const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userRole.user_id);
      if (authErr || !authUser?.user?.email) {
        return new Response(JSON.stringify({ error: "Could not resolve user account" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate a magic link token for this user
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: authUser.user.email,
      });

      if (linkErr || !linkData) {
        return new Response(JSON.stringify({ error: "Failed to generate login token" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        token_hash: linkData.properties?.hashed_token,
        email: authUser.user.email,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
