import { createServerSideClient } from "@/utils/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sprout, Plus, Trash2, Calendar, ShieldCheck, ShoppingBag, Landmark, Clock, RefreshCw, Phone, MapPin, Tag, Truck, Users } from "lucide-react";
import { deleteProduceAction, updateOrderStatusAction } from "@/app/actions/produce";

export const dynamic = "force-dynamic";

export default async function FarmerDashboard() {
  const supabase = await createServerSideClient();

  // 1. Get logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Query user profiles and farmer profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, farmer_profiles(*)")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "farmer") {
    redirect("/login");
  }

  // 3. Query active produce listings
  const { data: listings } = await supabase
    .from("produce")
    .select("*")
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false });

  // 4. Query incoming orders
  // Using explicit joint reference profiles!orders_buyer_id_fkey to prevent relational join ambiguity
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:profiles!orders_buyer_id_fkey (
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
          category
        )
      )
    `)
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false });

  const activeListingsCount = listings?.length || 0;
  
  // Calculate total completed revenue
  const totalSales = orders
    ?.filter(o => o.status === "completed" || o.status === "delivered")
    ?.reduce((sum, o) => sum + parseFloat(o.total_price), 0) || 0;

  const pendingOrdersCount = orders?.filter(o => o.status === "pending")?.length || 0;
  const activeDeliveriesCount = orders?.filter(o => o.status === "accepted" || o.status === "picked_up" || o.status === "in_transit")?.length || 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div className="flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="font-extrabold text-lg text-primary">Farmer Portal</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Ready
          </span>
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-card p-6 sm:p-8 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Welcome back, {profile.full_name || "Grower"}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-primary" />
              Managing <span className="font-bold text-slate-800">{profile.farmer_profiles?.farm_name || "Ghana Fresh Farm"}</span>
            </p>
          </div>
          <Link
            href="/dashboard/farmer/produce/new"
            className="inline-flex items-center space-x-2 bg-primary text-primary-foreground font-bold px-5 py-3 rounded-xl hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all text-sm border border-primary w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>List New Crop</span>
          </Link>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Metric 1 */}
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Active Listings</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">{activeListingsCount}</span>
              <Sprout className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Completed Sales</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">{totalSales.toFixed(2)} GHS</span>
              <Landmark className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Pending Orders</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-600">{pendingOrdersCount}</span>
              <Clock className="h-5 w-5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Transit Deliveries</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-sky-600">{activeDeliveriesCount}</span>
              <Truck className="h-5 w-5 text-sky-500" />
            </div>
          </div>
        </div>

        {/* Action Lists Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Active Listings Portal */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Active Crop Listings
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-semibold">
                Total {activeListingsCount}
              </span>
            </div>

            {listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((item) => (
                  <div key={item.id} className="bg-card border rounded-xl overflow-hidden shadow-sm flex hover:shadow-md transition-shadow relative">
                    <img
                      src={item.image_url || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-24 object-cover shrink-0"
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{item.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            item.freshness_tier === "Fresh" ? "bg-emerald-100 text-emerald-700" :
                            item.freshness_tier === "Good" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {item.freshness_tier}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 text-primary" />
                          {item.category} &bull; {item.quantity_available} {item.unit}(s) left
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <span className="text-sm font-extrabold text-primary">{item.price_per_unit} GHS / unit</span>
                        
                        {/* Delete Listing Action */}
                        <form action={deleteProduceAction.bind(null, item.id)}>
                          <button
                            type="submit"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border rounded-2xl p-12 text-center space-y-4">
                <Sprout className="h-12 w-12 text-muted-foreground/60 mx-auto" />
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  You don't have any crop listings available. Click "List New Crop" to list your tomatoes, peppers, or cabbage.
                </p>
              </div>
            )}
          </div>

          {/* Incoming Orders Panel */}
          <div className="space-y-4">
            <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Incoming Wholesale Orders
            </h2>

            {orders && orders.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {orders.map((order) => {
                  const buyerInfo = order.buyer;
                  return (
                    <div key={order.id} className="bg-card border rounded-xl p-5 space-y-4 shadow-sm">
                      {/* Order Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Order ID</span>
                          <h4 className="text-xs font-mono font-bold text-slate-700">{order.id.slice(0, 8)}...</h4>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          order.status === "pending" ? "bg-amber-100 text-amber-800" :
                          order.status === "accepted" ? "bg-emerald-100 text-emerald-800" :
                          order.status === "completed" ? "bg-green-600 text-white" :
                          order.status === "delivered" ? "bg-blue-600 text-white" :
                          "bg-slate-200 text-slate-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Buyer Metadata */}
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {buyerInfo?.full_name || "Unknown Buyer"}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          {buyerInfo?.phone_number || "No contact"}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {buyerInfo?.location_name || "Ashanti Corridor"}
                        </p>
                      </div>

                      {/* Order Items */}
                      <div className="bg-muted/30 p-3 rounded-lg space-y-1 text-xs">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between font-semibold text-slate-700">
                            <span>{item.produce?.name} x {item.quantity}</span>
                            <span>{item.price_at_purchase} GHS</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-black text-slate-950 pt-2 border-t mt-2">
                          <span>Total Payout</span>
                          <span>{order.total_price} GHS</span>
                        </div>
                      </div>

                      {/* State transitions */}
                      {order.status === "pending" && (
                        <div className="flex gap-2">
                          <form className="flex-1" action={updateOrderStatusAction.bind(null, order.id, "accepted")}>
                            <button
                              type="submit"
                              className="w-full text-xs font-bold bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/95 transition-all text-center"
                            >
                              Accept Order
                            </button>
                          </form>
                          <form className="flex-1" action={updateOrderStatusAction.bind(null, order.id, "rejected")}>
                            <button
                              type="submit"
                              className="w-full text-xs font-bold bg-muted text-muted-foreground border py-2 rounded-lg hover:bg-slate-200 transition-all text-center"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      )}

                      {order.status === "accepted" && (
                        <div className="text-center text-[11px] font-semibold text-sky-600 bg-sky-50 py-2 rounded-lg border border-sky-100 flex items-center justify-center gap-1.5">
                          <Truck className="h-3.5 w-3.5" />
                          <span>Awaiting Logistics Pick-Up</span>
                        </div>
                      )}

                      {order.status === "delivered" && (
                        <form action={updateOrderStatusAction.bind(null, order.id, "completed")}>
                          <button
                            type="submit"
                            className="w-full text-xs font-bold bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Confirm Payment & Completed
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border rounded-2xl p-12 text-center space-y-4">
                <Clock className="h-12 w-12 text-muted-foreground/60 mx-auto" />
                <p className="text-muted-foreground text-sm">
                  No orders have been placed for your farm produce yet. Active listings will appear in the buyer marketplace feed.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 text-center text-xs text-muted-foreground mt-12">
        <p>&copy; {new Date().getFullYear()} DigiFarmLink Ghana. Farmer Panel Workspace.</p>
      </footer>
    </div>
  );
}
