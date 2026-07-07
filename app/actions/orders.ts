"use server";

import { createServerSideClient } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

interface CheckoutItem {
  produceId: string;
  quantity: number;
}

export async function checkoutAction(items: CheckoutItem[]) {
  if (!items || items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  try {
    const supabase = await createServerSideClient();

    // 1. Get logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in to complete checkout." };
    }

    // Verify user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "buyer") {
      return { success: false, error: "Only wholesale buyers can place orders." };
    }

    // 2. Fetch produce listings from database to get live price, stock, and farmer_id
    const produceIds = items.map((i) => i.produceId);
    const { data: produceList, error: pErr } = await supabase
      .from("produce")
      .select("id, farmer_id, name, price_per_unit, quantity_available")
      .in("id", produceIds);

    if (pErr || !produceList) {
      return { success: false, error: "Failed to verify produce items in database." };
    }

    // 3. Group checkout items by farmer_id
    const itemsByFarmer: Record<
      string,
      { produceId: string; quantity: number; price: number; name: string }[]
    > = {};

    for (const item of items) {
      const dbProduce = produceList.find((p) => p.id === item.produceId);
      if (!dbProduce) {
        return { success: false, error: `Item no longer available in marketplace.` };
      }
      if (dbProduce.quantity_available < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${dbProduce.name}". Only ${dbProduce.quantity_available} bags available.`,
        };
      }

      const farmerId = dbProduce.farmer_id;
      if (!itemsByFarmer[farmerId]) {
        itemsByFarmer[farmerId] = [];
      }
      itemsByFarmer[farmerId].push({
        produceId: item.produceId,
        quantity: item.quantity,
        price: parseFloat(dbProduce.price_per_unit as any),
        name: dbProduce.name,
      });
    }

    // 4. Create an order for each farmer (Split Order structure)
    for (const [farmerId, farmerItems] of Object.entries(itemsByFarmer)) {
      const orderTotal = farmerItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      // Create Order record
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          farmer_id: farmerId,
          total_price: orderTotal,
          status: "pending",
        })
        .select()
        .single();

      if (orderErr || !order) {
        return { success: false, error: `Failed to place order. ${orderErr?.message}` };
      }

      // Create Order Items and update produce quantities
      for (const item of farmerItems) {
        // Insert order item
        const { error: itemErr } = await supabase.from("order_items").insert({
          order_id: order.id,
          produce_id: item.produceId,
          quantity: item.quantity,
          price_at_purchase: item.price,
        });

        if (itemErr) {
          return { success: false, error: `Failed to create order items. ${itemErr.message}` };
        }

        // Decrement crop stock
        const { error: stockErr } = await supabase.rpc("decrement_produce_stock", {
          produce_id_param: item.produceId,
          quantity_param: item.quantity,
        });

        // Fallback update if RPC function is missing
        if (stockErr) {
          const dbProduce = produceList.find((p) => p.id === item.produceId)!;
          await supabase
            .from("produce")
            .update({ quantity_available: dbProduce.quantity_available - item.quantity })
            .eq("id", item.produceId);
        }
      }

      // 5. Send Notification to Farmer
      await supabase.from("notifications").insert({
        user_id: farmerId,
        title: "New Wholesale Order Received!",
        message: `${profile.full_name || "A buyer"} has placed an order for your crops totaling ${orderTotal.toFixed(2)} GHS. Please visit your Farmer Portal to accept or decline.`,
      });
    }

    // Revalidate paths to refresh stock counts
    revalidatePath("/marketplace");
    revalidatePath("/dashboard/farmer");
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred during checkout." };
  }
}

export async function confirmOrderDeliveryAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSideClient();

    // 1. Get logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    // 2. Fetch order to verify ownership
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("buyer_id, farmer_id, total_price")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return { success: false, error: "Order not found." };
    }

    if (order.buyer_id !== user.id) {
      return { success: false, error: "Unauthorized. Only the buyer who placed the order can confirm delivery." };
    }

    // 3. Update order status to completed
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      return { success: false, error: `Failed to confirm delivery: ${updateError.message}` };
    }

    // 4. Send notification to the farmer
    await supabase.from("notifications").insert({
      user_id: order.farmer_id,
      title: "Order Completed & Payout Finalized!",
      message: `The buyer has confirmed receipt of order ${orderId.slice(0, 8)}. Payout of ${parseFloat(order.total_price as any).toFixed(2)} GHS is now finalized.`,
    });

    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/farmer");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function submitReviewAction(
  orderId: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSideClient();

    // 1. Get logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    // 2. Fetch order to verify ownership
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("buyer_id, farmer_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return { success: false, error: "Order not found." };
    }

    if (order.buyer_id !== user.id) {
      return { success: false, error: "Unauthorized. Only the buyer who placed the order can review it." };
    }

    // 3. Insert review
    const { error: reviewError } = await supabase
      .from("reviews")
      .insert({
        order_id: orderId,
        reviewer_id: user.id,
        reviewed_user_id: order.farmer_id,
        rating,
        comment,
      });

    if (reviewError) {
      return { success: false, error: `Failed to submit review: ${reviewError.message}` };
    }

    // 4. Send notification to the farmer
    await supabase.from("notifications").insert({
      user_id: order.farmer_id,
      title: "You Received a New Review!",
      message: `A buyer left you a ${rating}-star review for order ${orderId.slice(0, 8)}.`,
    });

    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/farmer");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
