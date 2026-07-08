import { createServerSideClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import AdminClientDashboard from "@/components/AdminClientDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSideClient();

  // 1. Get logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Query user profile to verify role is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // If the profile does not exist in the database, sign the user out to break any middleware redirect loops
    await supabase.auth.signOut();
    redirect("/login?error=profile_not_found");
  }

  if (profile.role !== "admin") {
    redirect(`/dashboard/${profile.role}`);
  }

  // 3. Query all users (to extract role distribution stats and details)
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const farmersCount = allProfiles?.filter((p) => p.role === "farmer").length || 0;
  const buyersCount = allProfiles?.filter((p) => p.role === "buyer").length || 0;
  const transportersCount = allProfiles?.filter((p) => p.role === "transporter").length || 0;
  const totalUsers = allProfiles?.length || 0;

  // 4. Query produce listings (to compute category metrics and details)
  const { data: listings } = await supabase
    .from("produce")
    .select(`
      *,
      farmer:profiles!produce_farmer_id_fkey (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  const categories = ["Tomatoes", "Pepper", "Garden Eggs", "Okra", "Cabbage", "Lettuce", "Spinach", "Onions"];
  const categoryData = categories.map((cat) => {
    const count = listings?.filter((item) => item.category.toLowerCase() === cat.toLowerCase()).length || 0;
    return { name: cat, value: count };
  });

  const totalListings = listings?.length || 0;

  // 5. Query orders metrics
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:profiles!orders_buyer_id_fkey (
        full_name
      ),
      farmer:profiles!orders_farmer_id_fkey (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  const totalOrdersCount = orders?.length || 0;
  const totalSales = orders
    ?.filter((o) => o.status === "completed" || o.status === "delivered")
    ?.reduce((sum, o) => sum + parseFloat(o.total_price as any), 0) || 0;

  // 6. Query pending logistics requests
  const { data: pendingTransports } = await supabase
    .from("transport_requests")
    .select("id")
    .eq("status", "pending");

  const pendingDeliveriesCount = pendingTransports?.length || 0;

  // 7. Query administrative logs
  const { data: rawLogs } = await supabase
    .from("admin_logs")
    .select(`
      *,
      admin:profiles!admin_logs_admin_id_fkey (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  const adminLogs = rawLogs || [];

  return (
    <AdminClientDashboard
      adminName={profile.full_name || "Administrator"}
      stats={{
        totalSales,
        totalListings,
        totalUsers,
        pendingDeliveries: pendingDeliveriesCount,
        farmersCount,
        buyersCount,
        transportersCount,
      }}
      categoryData={categoryData}
      users={allProfiles || []}
      listings={listings || []}
      orders={orders || []}
      logs={adminLogs}
    />
  );
}
