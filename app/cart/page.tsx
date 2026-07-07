"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { checkoutAction } from "@/app/actions/orders";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Sprout, ShoppingBag, Trash2, Plus, Minus, CreditCard, ChevronRight, AlertCircle, CheckCircle2, ArrowRight, Loader2, Landmark } from "lucide-react";

interface AuthUser {
  authenticated: boolean;
  email?: string;
  role?: string;
  name?: string;
  location?: string;
}

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [user, setUser] = useState<AuthUser>({ authenticated: false });
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch authentication status using our server-side proxy route
  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to load user session:", err);
      } finally {
        setLoadingAuth(false);
      }
    }
    fetchAuth();
  }, []);

  const handleCheckout = () => {
    if (!user.authenticated) return;
    if (user.role !== "buyer") return;

    setCheckoutError(null);

    const checkoutItems = cartItems.map((item) => ({
      produceId: item.produceId,
      quantity: item.quantity,
    }));

    if (typeof window !== "undefined" && !navigator.onLine) {
      const { queueOfflineAction } = require("@/hooks/useOfflineSync");
      queueOfflineAction("checkout", checkoutItems);
      clearCart();
      setCheckoutSuccess(true);
      return;
    }

    startTransition(async () => {
      const result = await checkoutAction(checkoutItems);
      if (!result.success) {
        setCheckoutError(result.error || "Failed to process checkout.");
      } else {
        const { showToast } = require("@/components/ToastContainer");
        showToast("Wholesale orders placed successfully!", "success");
        clearCart();
        setCheckoutSuccess(true);
      }
    });
  };

  if (checkoutSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-md text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">Checkout Success!</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your wholesale crop orders have been placed successfully. Farmers have been notified to review and accept your requests.
              </p>
            </div>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs text-primary font-semibold text-center">
              Awaiting logistics transport requests broadcasts.
            </div>
            <div className="flex gap-4 pt-2">
              <Link
                href="/marketplace"
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 hover:shadow-lg transition-all text-sm border border-primary text-center"
              >
                Browse More Produce
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Your Wholesale Cart
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Review your wholesale crop selections before submitting orders.
          </p>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b hidden sm:grid grid-cols-12 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  <div className="col-span-6">Crop Name</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.produceId} className="p-5 grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
                      {/* Name & Details */}
                      <div className="col-span-1 sm:col-span-6 space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.produceId)}
                          className="text-xs font-bold text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove Item</span>
                        </button>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 sm:col-span-2 sm:text-center text-sm font-semibold text-slate-700">
                        <span className="sm:hidden text-xs text-muted-foreground block font-bold uppercase tracking-wide mb-0.5">Price</span>
                        {item.price} GHS
                      </div>

                      {/* Quantity Controller */}
                      <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                        <div>
                          <span className="sm:hidden text-xs text-muted-foreground block font-bold uppercase tracking-wide mb-1">Quantity</span>
                          <div className="flex items-center border rounded-xl overflow-hidden bg-muted/20">
                            <button
                              onClick={() => updateQuantity(item.produceId, item.quantity - 1)}
                              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-slate-800 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.produceId, item.quantity + 1)}
                              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-slate-800 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-1 sm:col-span-2 text-left sm:text-right text-sm sm:text-base font-black text-primary">
                        <span className="sm:hidden text-xs text-muted-foreground block font-bold uppercase tracking-wide mb-0.5">Subtotal</span>
                        {(item.price * item.quantity).toFixed(2)} GHS
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkout & Order Summary card */}
            <div className="space-y-6">
              <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="font-extrabold text-lg text-slate-900 pb-3 border-b">
                  Order Summary
                </h3>

                {/* Subtotals */}
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal sum</span>
                    <span>{cartTotal.toFixed(2)} GHS</span>
                  </div>
                  <div className="flex justify-between font-semibold text-xs text-muted-foreground">
                    <span>Logistics transit fee</span>
                    <span>Broadcasting pending...</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-950 text-base pt-3 border-t">
                    <span>Order Total</span>
                    <span>{cartTotal.toFixed(2)} GHS</span>
                  </div>
                </div>

                {/* Validation messages */}
                {checkoutError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {loadingAuth ? (
                  <div className="flex items-center justify-center py-2 text-xs font-semibold text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying credentials...
                  </div>
                ) : !user.authenticated ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-bold">Login Required</p>
                        <p className="mt-0.5 text-amber-700/90">Please sign in to your buyer account to complete order checkout.</p>
                      </div>
                    </div>
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/95 hover:shadow-lg transition-all text-sm border border-primary"
                    >
                      <span>Sign In to Checkout</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                ) : user.role !== "buyer" ? (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-4 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Incorrect Account Role</p>
                      <p className="mt-0.5">Your current login role is <span className="font-bold uppercase">{user.role}</span>. Only wholesale buyers can place marketplace orders. Please log out and sign in with a buyer account.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Buyer location details info box */}
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-2 text-xs">
                      <h4 className="font-bold text-primary flex items-center gap-1">
                        <Landmark className="h-3.5 w-3.5" />
                        Buyer Proximity Reference
                      </h4>
                      <p className="text-muted-foreground">
                        Your delivery address is set as <span className="font-bold text-slate-800">{user.location}</span>. Spontaneous shipping routes are matched accordingly.
                      </p>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isPending}
                      className="w-full inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all text-sm border border-primary"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processing Orders...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4.5 w-4.5" />
                          <span>Place Wholesale Orders</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-2xl p-16 text-center space-y-5 shadow-sm max-w-xl mx-auto my-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/60 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-slate-900">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                Select some red tomatoes, peppers, or onions in our Ashanti corridor marketplace and add them to your cart.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/95 hover:shadow-lg transition-all text-sm border border-primary"
              >
                <span>Go to Marketplace</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
