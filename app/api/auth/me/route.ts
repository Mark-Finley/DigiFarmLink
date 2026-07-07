import { NextResponse } from "next/server";
import { createServerSideClient } from "@/utils/supabase";

export async function GET() {
  try {
    const supabase = await createServerSideClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      email: user.email,
      role: user.user_metadata?.role || "buyer",
      name: user.user_metadata?.full_name || "",
      location: user.user_metadata?.location_name || "Kumasi Central",
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
