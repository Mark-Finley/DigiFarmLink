import { NextResponse } from "next/server";
import { createServerSideClient } from "@/utils/supabase";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSideClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const role = data.user.user_metadata?.role || "buyer";
      const redirectUrl = `${origin}/dashboard/${role}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If code exchange fails, redirect back to login with an error param
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
