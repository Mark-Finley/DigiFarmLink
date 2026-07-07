"use client";

import { useState, useTransition } from "react";
import AdminAnalytics from "@/components/AdminAnalytics";
import { deleteProduceAdminAction, suspendUserAdminAction } from "@/app/actions/admin";
import { ShieldAlert, Users, Sprout, Landmark, ClipboardList, TrendingUp, AlertTriangle, UserCheck, Clock, Trash2, ShieldX, Eye } from "lucide-react";
import Link from "next/link";

interface DashboardProps {
  adminName: string;
  stats: {
    totalSales: number;
    totalListings: number;
    totalUsers: number;
    pendingDeliveries: number;
    farmersCount: number;
    buyersCount: number;
    transportersCount: number;
  };
  categoryData: { name: string; value: number }[];
  users: any[];
  listings: any[];
  orders: any[];
  logs: any[];
}

export default function AdminClientDashboard({
  adminName,
  stats,
  categoryData,
  users,
  listings,
  orders,
  logs,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "listings" | "orders" | "logs">("overview");
  const [isPending, startTransition] = useTransition();

  const handleSuspend = (userId: string) => {
    startTransition(async () => {
      await suspendUserAdminAction(userId);
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <span className="font-extrabold text-lg text-primary">Admin Control Center</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Admin Space */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-card p-5 sm:p-6 border rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Platform Overview, {adminName}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              System status: <span className="text-emerald-600 font-bold">Online</span> &bull; Regional hub connections operational.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-xl w-full md:w-auto border">
            {(["overview", "users", "listings", "orders", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-card text-slate-900 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                }`}
              >
                {tab === "logs" ? "Audit Logs" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 */}
          <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Completed Payouts</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{stats.totalSales.toFixed(2)} GHS</span>
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active Listings</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{stats.totalListings} crops</span>
              <Sprout className="h-4.5 w-4.5 text-primary" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Registered Accounts</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">{stats.totalUsers} users</span>
              <Users className="h-4.5 w-4.5 text-primary" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Logistics Backlog</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-600">{stats.pendingDeliveries} pending</span>
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Dynamic Workspace Content */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm min-h-[400px]">
          
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <AdminAnalytics categoryData={categoryData} />
              </div>
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-extrabold text-sm uppercase text-slate-700 tracking-wider">
                  Corridor Hub Registrations
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 border rounded-xl text-center space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Farmers</span>
                    <p className="text-xl font-black text-slate-850">{stats.farmersCount}</p>
                  </div>
                  <div className="bg-slate-50 p-4 border rounded-xl text-center space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Buyers</span>
                    <p className="text-xl font-black text-slate-850">{stats.buyersCount}</p>
                  </div>
                  <div className="bg-slate-50 p-4 border rounded-xl text-center space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Transporters</span>
                    <p className="text-xl font-black text-slate-850">{stats.transportersCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Users Moderation */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">User Moderation</h2>
                <p className="text-xs text-muted-foreground">Manage roles, suspend accounts, and view phone listings.</p>
              </div>
              <div className="overflow-x-auto border rounded-xl divide-y">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b">
                      <th className="p-3">User ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Hub Location</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 font-medium">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-[10px] text-muted-foreground">{u.id.slice(0, 8)}...</td>
                        <td className="p-3 font-bold text-slate-900">{u.full_name || "N/A"}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3 capitalize">{u.role}</td>
                        <td className="p-3">{u.location_name || "Ashanti Corridor"}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleSuspend(u.id)}
                            className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors inline-flex items-center gap-1"
                          >
                            <ShieldX className="h-3 w-3" />
                            <span>Suspend</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Listings Moderation */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">Listings Moderation</h2>
                <p className="text-xs text-muted-foreground">Moderate crop listings and delete policy-violating produce posts.</p>
              </div>
              <div className="overflow-x-auto border rounded-xl divide-y">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b">
                      <th className="p-3">Produce ID</th>
                      <th className="p-3">Crop Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Stock Left</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Farmer</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 font-medium">
                    {listings.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-[10px] text-muted-foreground">{item.id.slice(0, 8)}...</td>
                        <td className="p-3 font-bold text-slate-900">{item.name}</td>
                        <td className="p-3">{item.category}</td>
                        <td className="p-3">{item.quantity_available} {item.unit}s</td>
                        <td className="p-3 font-bold text-primary">{item.price_per_unit} GHS</td>
                        <td className="p-3">{item.farmer?.full_name || "Farmer"}</td>
                        <td className="p-3 text-right">
                          <form action={deleteProduceAdminAction.bind(null, item.id)}>
                            <button
                              type="submit"
                              className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-lg hover:bg-destructive/20 transition-colors inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Orders Tracking */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">Orders Tracking</h2>
                <p className="text-xs text-muted-foreground">Monitor platform orders progress and checkout flows.</p>
              </div>
              <div className="overflow-x-auto border rounded-xl divide-y">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Buyer Name</th>
                      <th className="p-3">Farmer Name</th>
                      <th className="p-3">Total Sum</th>
                      <th className="p-3">Order Date</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 font-medium">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-[10px] text-muted-foreground">{o.id.slice(0, 8)}...</td>
                        <td className="p-3 font-bold text-slate-900">{o.buyer?.full_name || "Buyer"}</td>
                        <td className="p-3">{o.farmer?.full_name || "Farmer"}</td>
                        <td className="p-3 font-extrabold text-primary">{o.total_price} GHS</td>
                        <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            o.status === "pending" ? "bg-amber-100 text-amber-800" :
                            o.status === "accepted" ? "bg-emerald-100 text-emerald-800" :
                            o.status === "completed" ? "bg-green-600 text-white" :
                            o.status === "delivered" ? "bg-blue-600 text-white" :
                            "bg-slate-200 text-slate-700"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Audit Logs */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-extrabold text-lg text-slate-900">Administrative Audit Ledger</h2>
                <p className="text-xs text-muted-foreground">Audit logs history representing all administrative operations.</p>
              </div>
              <div className="space-y-4 divide-y max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex justify-between items-start text-[11px] font-semibold">
                      <span className="text-primary flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5" />
                        {log.admin?.full_name || "Admin"}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {log.action}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Target: {log.target_type} ({log.target_id?.slice(0, 8)}...)
                    </p>
                    {log.details && (
                      <div className="bg-slate-50 border p-2.5 rounded-lg text-[10px] font-mono text-slate-600 break-all">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 text-center text-xs text-muted-foreground mt-12">
        <p>&copy; {new Date().getFullYear()} DigiFarmLink Ghana. Admin Dashboard Portal.</p>
      </footer>
    </div>
  );
}
