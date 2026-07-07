"use server";

import { createServerSideClient } from "@/utils/supabase";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    const supabase = await createServerSideClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const role = data.user?.user_metadata?.role || "buyer";
    return { success: true, role };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function registerAction(formData: FormData) {
  const role = formData.get("role") as string;
  const fullName = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  const location = formData.get("location") as string;

  if (!email || !password || !fullName || !role) {
    return { success: false, error: "Please fill out all required fields." };
  }

  // Predefined coordinates for Ashanti Region towns to support distance sorting later
  const coordinatesMap: Record<string, { lat: number; lon: number }> = {
    "Kumasi Central": { lat: 6.696, lon: -1.624 },
    Mampong: { lat: 7.062, lon: -1.403 },
    Obuasi: { lat: 6.206, lon: -1.669 },
    Ejura: { lat: 7.378, lon: -1.374 },
    Konongo: { lat: 6.616, lon: -1.214 },
    Bekwai: { lat: 6.452, lon: -1.585 },
    Offinso: { lat: 6.890, lon: -1.650 },
  };

  const selectedLocation = location || "Kumasi Central";
  const coords = coordinatesMap[selectedLocation] || coordinatesMap["Kumasi Central"];

  try {
    const supabase = await createServerSideClient();
    
    // Metadata passed will trigger the on_auth_user_created DB trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`,
        data: {
          role,
          full_name: fullName,
          phone_number: phone || "",
          location_name: selectedLocation,
          latitude: coords.lat,
          longitude: coords.lon,
          farm_name: role === "farmer" ? `${fullName} Farms` : null,
          business_name: role === "buyer" ? `${fullName} Retail` : null,
          vehicle_type: role === "transporter" ? "Tricycle/Aboboyaa" : null,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred during registration." };
  }
}

export async function signOutAction(formData?: FormData) {
  try {
    const supabase = await createServerSideClient();
    await supabase.auth.signOut();
  } catch (err: any) {
    // Fail silently, redirect regardless to clear client cache
  }
  redirect("/");
}
