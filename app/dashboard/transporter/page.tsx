import { createServerSideClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import TransporterClientDashboard, { TransportJob } from "@/components/TransporterClientDashboard";

export const dynamic = "force-dynamic";

export default async function TransporterDashboardPage() {
  const supabase = await createServerSideClient();

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Query user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, transport_profiles(*)")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "transporter") {
    redirect("/login");
  }

  // 3. Query available pending requests
  const { data: pendingRaw } = await supabase
    .from("transport_requests")
    .select(`
      *,
      order:orders (
        buyer:profiles!orders_buyer_id_fkey (
          full_name,
          phone_number
        ),
        farmer:profiles!orders_farmer_id_fkey (
          full_name,
          phone_number
        )
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // 4. Query active jobs (limit to 1 active route for demonstration)
  const { data: activeRaw } = await supabase
    .from("transport_requests")
    .select(`
      *,
      order:orders (
        buyer:profiles!orders_buyer_id_fkey (
          full_name,
          phone_number
        ),
        farmer:profiles!orders_farmer_id_fkey (
          full_name,
          phone_number
        )
      )
    `)
    .eq("transporter_id", user.id)
    .neq("status", "delivered")
    .limit(1);

  // 5. Query completed earnings
  const { data: completedRaw } = await supabase
    .from("transport_requests")
    .select("fare")
    .eq("transporter_id", user.id)
    .eq("status", "delivered");

  const pendingRequests = (pendingRaw as unknown as TransportJob[]) || [];
  const activeRequest = activeRaw && activeRaw.length > 0 ? (activeRaw[0] as unknown as TransportJob) : null;
  
  const completedRequestsCount = completedRaw?.length || 0;
  const totalEarnings = completedRaw?.reduce((sum, r) => sum + parseFloat(r.fare as any), 0) || 0;

  return (
    <TransporterClientDashboard
      profile={{
        full_name: profile.full_name || "Transporter",
        location_name: profile.location_name || "Ashanti Corridor",
      }}
      pendingRequests={pendingRequests}
      activeRequest={activeRequest}
      completedRequestsCount={completedRequestsCount}
      totalEarnings={totalEarnings}
    />
  );
}
