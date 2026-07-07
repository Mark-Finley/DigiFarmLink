"use server";

import { createServerSideClient } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

export async function acceptTransportRequestAction(requestId: string, formData?: FormData): Promise<void> {
  try {
    const supabase = await createServerSideClient();

    // Verify session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Verify user role is transporter
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "transporter") return;

    // 1. Update Transport Request
    const { data: req, error: reqErr } = await supabase
      .from("transport_requests")
      .update({
        transporter_id: user.id,
        status: "accepted",
      })
      .eq("id", requestId)
      .select("order_id")
      .single();

    if (reqErr || !req) return;

    // 2. Update Order Status to accepted
    await supabase
      .from("orders")
      .update({ status: "accepted" })
      .eq("id", req.order_id);

    revalidatePath("/dashboard/transporter");
  } catch (error) {
    // Fail silently
  }
}

export async function updateTransportStatusAction(
  requestId: string,
  status: "picked_up" | "in_transit" | "delivered",
  formData?: FormData
): Promise<void> {
  try {
    const supabase = await createServerSideClient();

    // Verify session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Update Transport Request
    const { data: req, error: reqErr } = await supabase
      .from("transport_requests")
      .update({ status })
      .eq("id", requestId)
      .eq("transporter_id", user.id)
      .select("order_id")
      .single();

    if (reqErr || !req) return;

    // 2. Update associated Order Status to match transit progress
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", req.order_id);

    // Send notifications to involved farmer & buyer if delivered
    if (status === "delivered") {
      const { data: order } = await supabase
        .from("orders")
        .select("buyer_id, farmer_id")
        .eq("id", req.order_id)
        .single();

      if (order) {
        // Notify buyer
        await supabase.from("notifications").insert({
          user_id: order.buyer_id,
          title: "Produce Delivered!",
          message: "Your crop delivery has arrived at your location. Please review the shipment, confirm receipt, and release payout inside the checkout portal.",
        });

        // Notify farmer
        await supabase.from("notifications").insert({
          user_id: order.farmer_id,
          title: "Shipment Delivered to Buyer",
          message: "Your produce transit has completed delivery. Payment will be finalized upon buyer confirming receipt.",
        });
      }
    }

    revalidatePath("/dashboard/transporter");
  } catch (error) {
    // Fail silently
  }
}
