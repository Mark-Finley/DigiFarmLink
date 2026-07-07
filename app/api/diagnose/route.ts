import { NextResponse } from "next/server";
import { createServerSideClient } from "@/utils/supabase";

export async function GET() {
  const supabase = await createServerSideClient();

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      supabase_url_exists: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
      supabase_anon_key_exists: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY),
    },
  };

  try {
    // 1. Check Profiles Table
    const { data: profiles, error: pError, count } = await supabase
      .from("profiles")
      .select("id, email, role", { count: "exact" });

    diagnostics.profiles = {
      success: !pError,
      count: count ?? 0,
      error: pError ? pError.message : null,
      sample: profiles ? profiles.slice(0, 3) : [],
    };

    // 2. Check Produce Table
    const { data: produce, error: prError, count: prCount } = await supabase
      .from("produce")
      .select("id, name", { count: "exact" });

    diagnostics.produce = {
      success: !prError,
      count: prCount ?? 0,
      error: prError ? prError.message : null,
    };

    return NextResponse.json(diagnostics);
  } catch (err: any) {
    diagnostics.error = err.message || "Unexpected crash";
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
