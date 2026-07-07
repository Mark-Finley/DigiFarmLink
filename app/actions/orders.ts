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
