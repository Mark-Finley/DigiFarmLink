"use client";

import { useState, useTransition } from "react";
import { confirmOrderDeliveryAction, submitReviewAction } from "@/app/actions/orders";
import { ShoppingBag, Landmark, Clock, CheckCircle2, AlertCircle, MessageSquare, Star, ArrowRight, User, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  produce?: {
    name: string;
    unit: string;
    category: string;
  } | null;
}

export interface BuyerOrder {
  id: string;
  farmer_id: string;
  total_price: number;
  status: string;
  created_at: string;
  farmer?: {
    full_name: string;
    phone_number: string;
    location_name: string;
  } | null;
  order_items: OrderItem[];
  has_review: boolean;
}

interface BuyerClientDashboardProps {
  profile: {
    full_name: string;
    location_name: string;
  };
  orders: BuyerOrder[];
}

export default function BuyerClientDashboard({
  profile,
  orders,
}: BuyerClientDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<BuyerOrder | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Compute stats
  const totalSpend = orders
    .filter((o) => o.status === "completed" || o.status === "delivered")
    .reduce((sum, o) => sum + parseFloat(o.total_price as any), 0);

  const activeOrdersCount = orders.filter(
    (o) => o.status !== "completed" && o.status !== "rejected" && o.status !== "cancelled"
  ).length;

  const completedOrdersCount = orders.filter((o) => o.status === "completed").length;
  const totalOrdersCount = orders.length;

  const handleConfirmDelivery = (orderId: string) => {
    if (confirm("Are you sure you want to confirm delivery for this order? This will authorize payout to the farmer.")) {
      startTransition(async () => {
        const result = await confirmOrderDeliveryAction(orderId);
        if (!result.success) {
          alert(result.error || "Failed to confirm delivery.");
        } else {
          alert("Delivery confirmed! Payout has been finalized.");
        }
      });
    }
  };

  const handleOpenReviewModal = (order: BuyerOrder) => {
    setSelectedOrderForReview(order);
    setRating(5);
    setComment("");
    setReviewError(null);
    setReviewSuccess(false);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;
    setReviewError(null);
    setReviewSuccess(false);

    startTransition(async () => {
      const result = await submitReviewAction(selectedOrderForReview.id, rating, comment);
      if (!result.success) {
        setReviewError(result.error || "Failed to submit review.");
      } else {
        setReviewSuccess(true);
        setTimeout(() => {
          setSelectedOrderForReview(null);
        }, 1000);
      }
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "accepted":
        return "bg-sky-100 text-sky-850 border-sky-200";
      case "picked_up":
        return "bg-purple-100 text-purple-850 border-purple-200";
      case "in_transit":
        return "bg-indigo-100 text-indigo-850 border-indigo-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-850 border-emerald-200 animate-pulse";
      case "completed":
        return "bg-green-600 text-white border-transparent";
      case "rejected":
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <span className="font-extrabold text-lg text-primary">Buyer Dashboard</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/marketplace"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Go to Marketplace</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Welcome Card */}
        <div className="bg-card p-5 sm:p-6 border rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Welcome Back, {profile.full_name}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              <span>Hub Location: {profile.location_name || "Ashanti Corridor"}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Spent</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{totalSpend.toFixed(2)} GHS</span>
              <Landmark className="h-4.5 w-4.5 text-emerald-500" />
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active Orders</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{activeOrdersCount}</span>
              <Clock className="h-4.5 w-4.5 text-amber-500" />
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Completed Deliveries</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{completedOrdersCount}</span>
              <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
            </div>
          </div>

          <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Orders</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{totalOrdersCount}</span>
              <ShoppingBag className="h-4.5 w-4.5 text-primary" />
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm min-h-[400px] space-y-4">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900">Your Crop Orders</h2>
            <p className="text-xs text-muted-foreground">Track wholesale orders, confirm delivery, and provide feedback.</p>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-slate-50/50 border border-dashed rounded-xl">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/60" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-sm">No orders placed yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Browse crop listings from local Ashanti region farmers to place your first wholesale order.
                </p>
              </div>
              <Link
                href="/marketplace"
                className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary/95 transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className="border rounded-xl shadow-sm overflow-hidden bg-card hover:border-slate-350 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 border-b">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Order Total</span>
                          <span className="font-black text-sm text-primary">{parseFloat(order.total_price as any).toFixed(2)} GHS</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="px-2.5 py-1.5 border rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                          </button>
                          
                          {/* Confirm Delivery button: only shown for 'delivered' status */}
                          {order.status === "delivered" && (
                            <button
                              onClick={() => handleConfirmDelivery(order.id)}
                              disabled={isPending}
                              className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/95 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Confirm Delivery</span>
                            </button>
                          )}

                          {/* Leave Review button: shown only if order is completed and not reviewed yet */}
                          {order.status === "completed" && !order.has_review && (
                            <button
                              onClick={() => handleOpenReviewModal(order)}
                              className="px-3 py-1.5 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors flex items-center gap-1"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>Leave Review</span>
                            </button>
                          )}
                          
                          {order.has_review && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1">
                              <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                              <span>Reviewed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details section */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 space-y-4 bg-card divide-y divide-dashed">
                        {/* Farmer and items list */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-4">
                          {/* Farmer Card */}
                          <div className="md:col-span-4 space-y-3 bg-slate-50 p-4 border rounded-xl">
                            <h4 className="font-extrabold text-xs uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-primary" />
                              <span>Farmer Details</span>
                            </h4>
                            <div className="space-y-1.5 text-xs font-semibold text-slate-800">
                              <p className="font-bold text-slate-900">{order.farmer?.full_name || "Ghana Fresh Farmer"}</p>
                              {order.farmer?.phone_number && (
                                <p className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{order.farmer.phone_number}</span>
                                </p>
                              )}
                              <p className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{order.farmer?.location_name || "Ashanti Region Hub"}</span>
                              </p>
                            </div>
                          </div>

                          {/* Items Card */}
                          <div className="md:col-span-8 space-y-3">
                            <h4 className="font-extrabold text-xs uppercase text-slate-700 tracking-wider">
                              Crops Summary
                            </h4>
                            <div className="border rounded-xl overflow-hidden divide-y text-xs">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="p-3 flex justify-between items-center hover:bg-slate-50/20">
                                  <div>
                                    <p className="font-bold text-slate-900">{item.produce?.name || "Marketplace Produce"}</p>
                                    <p className="text-[10px] text-muted-foreground capitalize">Category: {item.produce?.category || "Vegetable"}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-slate-800">{item.quantity} {item.produce?.unit || "bag"}s</p>
                                    <p className="text-[10px] text-muted-foreground">{parseFloat(item.price_at_purchase as any).toFixed(2)} GHS per unit</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Workflow tracker visual */}
                        <div className="pt-4 space-y-3">
                          <h4 className="font-extrabold text-xs uppercase text-slate-700 tracking-wider">
                            Order Delivery Tracking
                          </h4>
                          
                          <div className="relative pt-4 pb-2">
                            {/* Line connecting steps */}
                            <div className="absolute top-[26px] left-[5%] right-[5%] h-1 bg-slate-200 z-0 rounded" />
                            
                            {/* Highlight line based on status */}
                            <div
                              className="absolute top-[26px] left-[5%] h-1 bg-primary z-0 rounded transition-all duration-300"
                              style={{
                                width: 
                                  order.status === "pending" ? "0%" :
                                  order.status === "accepted" ? "33%" :
                                  (order.status === "picked_up" || order.status === "in_transit") ? "66%" :
                                  (order.status === "delivered" || order.status === "completed") ? "90%" : "0%"
                              }}
                            />

                            <div className="grid grid-cols-4 relative z-10 text-center text-[10px]">
                              {/* Step 1: Placed */}
                              <div className="space-y-2">
                                <div className={`h-6 w-6 rounded-full mx-auto flex items-center justify-center border font-bold ${
                                  true ? "bg-primary border-primary text-white" : "bg-white text-slate-400 border-slate-200"
                                }`}>
                                  1
                                </div>
                                <span className="font-extrabold text-slate-950 block">Placed</span>
                              </div>

                              {/* Step 2: Accepted */}
                              <div className="space-y-2">
                                <div className={`h-6 w-6 rounded-full mx-auto flex items-center justify-center border font-bold transition-colors ${
                                  order.status !== "pending" && order.status !== "rejected" && order.status !== "cancelled"
                                    ? "bg-primary border-primary text-white" : "bg-white text-slate-400 border-slate-200"
                                }`}>
                                  2
                                </div>
                                <span className={`font-extrabold block ${
                                  order.status !== "pending" && order.status !== "rejected" && order.status !== "cancelled"
                                    ? "text-slate-950" : "text-muted-foreground"
                                }`}>Accepted</span>
                              </div>

                              {/* Step 3: Transit */}
                              <div className="space-y-2">
                                <div className={`h-6 w-6 rounded-full mx-auto flex items-center justify-center border font-bold transition-colors ${
                                  order.status === "picked_up" || order.status === "in_transit" || order.status === "delivered" || order.status === "completed"
                                    ? "bg-primary border-primary text-white" : "bg-white text-slate-400 border-slate-200"
                                }`}>
                                  3
                                </div>
                                <span className={`font-extrabold block ${
                                  order.status === "picked_up" || order.status === "in_transit" || order.status === "delivered" || order.status === "completed"
                                    ? "text-slate-950" : "text-muted-foreground"
                                }`}>In Transit</span>
                              </div>

                              {/* Step 4: Arrived */}
                              <div className="space-y-2">
                                <div className={`h-6 w-6 rounded-full mx-auto flex items-center justify-center border font-bold transition-colors ${
                                  order.status === "delivered" || order.status === "completed"
                                    ? "bg-primary border-primary text-white" : "bg-white text-slate-400 border-slate-200"
                                }`}>
                                  4
                                </div>
                                <span className={`font-extrabold block ${
                                  order.status === "delivered" || order.status === "completed"
                                    ? "text-slate-950" : "text-muted-foreground"
                                }`}>Delivered</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Leave Feedback Review Modal */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b px-6 py-4 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  Leave Farmer Feedback
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                  Order #{selectedOrderForReview.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForReview(null)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              {reviewError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg font-semibold">
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg font-semibold">
                  Review submitted successfully! Thank you!
                </div>
              )}

              <div className="space-y-2 text-center py-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  How would you rate the farmer's produce?
                </label>
                <div className="flex justify-center items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-115 transition-transform"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-650" htmlFor="review-comment">
                  Feedback Comment
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  required
                  placeholder="Tell us about the freshness of crops, delivery timeliness, or service..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="border-t pt-4 flex items-center justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setSelectedOrderForReview(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t bg-card py-6 text-center text-xs text-muted-foreground mt-12">
        <p>&copy; {new Date().getFullYear()} DigiFarmLink Ghana. Buyer Portal.</p>
      </footer>
    </div>
  );
}
