import { createServerSideClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import BuyerClientDashboard, { BuyerOrder } from "@/components/BuyerClientDashboard";

export const dynamic = "force-dynamic";

export default async function BuyerDashboardPage() {
  const supabase = await createServerSideClient();

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Query user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "buyer") {
    redirect("/login");
  }

  // 3. Query all orders placed by this buyer
  const { data: rawOrders } = await supabase
    .from("orders")
    .select(`
      *,
      farmer:profiles!orders_farmer_id_fkey (
        full_name,
        phone_number,
        location_name
      ),
      order_items (
        id,
        quantity,
        price_at_purchase,
        produce (
          name,
          unit,
          category
        )
      ),
      reviews (
        id
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  // 4. Map the order structure to include has_review indicator
  const orders: BuyerOrder[] = (rawOrders || []).map((o: any) => ({
    id: o.id,
    farmer_id: o.farmer_id,
    total_price: o.total_price,
    status: o.status,
    created_at: o.created_at,
    farmer: o.farmer,
    order_items: o.order_items,
    has_review: o.reviews && o.reviews.length > 0,
  }));

  return (
    <BuyerClientDashboard
      profile={{
        full_name: profile.full_name || "Buyer",
        location_name: profile.location_name || "Ashanti Corridor",
      }}
      orders={orders}
    />
  );
}
