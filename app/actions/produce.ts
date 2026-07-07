"use server";

import { createServerSideClient } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

// Coordinates Map for Ashanti municipalities
const coordinatesMap: Record<string, { lat: number; lon: number }> = {
  "Kumasi Central": { lat: 6.696, lon: -1.624 },
  Mampong: { lat: 7.062, lon: -1.403 },
  Obuasi: { lat: 6.206, lon: -1.669 },
  Ejura: { lat: 7.378, lon: -1.374 },
  Konongo: { lat: 6.616, lon: -1.214 },
  Bekwai: { lat: 6.452, lon: -1.585 },
  Offinso: { lat: 6.890, lon: -1.650 },
};

// Beautiful Unsplash cover images for categories
const categoryImages: Record<string, string> = {
  Tomatoes: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80",
  Pepper: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&q=80",
  "Garden Eggs": "https://images.unsplash.com/photo-1590377486603-51829e160e1d?w=400&q=80",
  Okra: "https://images.unsplash.com/photo-1623910393282-3db53fb16eb0?w=400&q=80",
  Cabbage: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
  Lettuce: "https://images.unsplash.com/photo-1622484211148-71700ccf0857?w=400&q=80",
  Spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
  Onions: "https://images.unsplash.com/photo-1508747703725-719ae25db29f?w=400&q=80",
};

export async function createProduceAction(formData: FormData) {
  try {
    const supabase = await createServerSideClient();

    // Verify session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    // Retrieve fields
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const priceStr = formData.get("price") as string;
    const qtyStr = formData.get("quantity") as string;
    const harvestDateStr = formData.get("harvest_date") as string;
    const freshness = formData.get("freshness") as string;
    const customImage = formData.get("image_url") as string;

    if (!name || !category || !priceStr || !qtyStr || !harvestDateStr || !freshness) {
      return { success: false, error: "Please fill in all fields." };
    }

    const price = parseFloat(priceStr);
    const quantity = parseFloat(qtyStr);

    if (isNaN(price) || price <= 0 || isNaN(quantity) || quantity < 0) {
      return { success: false, error: "Please provide valid numeric price and stock levels." };
    }

    // Get farmer location info
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("location_name, latitude, longitude")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: "Could not find profile location configuration." };
    }

    const image_url = customImage || categoryImages[category] || "https://via.placeholder.com/300?text=Produce";

    const { error } = await supabase
      .from("produce")
      .insert({
        farmer_id: user.id,
        name,
        category,
        price_per_unit: price,
        unit: "bag",
        quantity_available: quantity,
        harvest_date: harvestDateStr,
        freshness_tier: freshness,
        image_url,
        location_name: profile.location_name,
        latitude: profile.latitude,
        longitude: profile.longitude,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/marketplace");
    revalidatePath("/dashboard/farmer");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function deleteProduceAction(id: string, formData?: FormData): Promise<void> {
  try {
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("produce")
      .delete()
      .eq("id", id)
      .eq("farmer_id", user.id);

    revalidatePath("/marketplace");
    revalidatePath("/dashboard/farmer");
  } catch (err: any) {
    // Fail silently
  }
}

export async function updateOrderStatusAction(orderId: string, status: "accepted" | "rejected" | "completed" | "cancelled", formData?: FormData): Promise<void> {
  try {
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Update Order Status
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("farmer_id", user.id)
      .select("*, profiles!orders_buyer_id_fkey(location_name, latitude, longitude)")
      .single();

    if (orderErr || !order) return;

    // 2. If status is accepted, automatically spawn transport request
    if (status === "accepted") {
      // Get farmer details for pickup location
      const { data: farmerProfile } = await supabase
        .from("profiles")
        .select("location_name, latitude, longitude")
        .eq("id", user.id)
        .single();

      if (farmerProfile) {
        // Calculate dynamic fare (simple distance metric: 30 base + random factor for demonstration)
        const fareVal = Math.round(35 + Math.random() * 45);

        await supabase
          .from("transport_requests")
          .insert({
            order_id: orderId,
            status: "pending",
            pickup_latitude: farmerProfile.latitude,
            pickup_longitude: farmerProfile.longitude,
            pickup_address: farmerProfile.location_name,
            delivery_latitude: order.profiles?.latitude || 6.696,
            delivery_longitude: order.profiles?.longitude || -1.624,
            delivery_address: order.profiles?.location_name || "Kumasi Central",
            fare: fareVal,
          });
      }
    }

    revalidatePath("/dashboard/farmer");
  } catch (err: any) {
    // Fail silently
  }
}
