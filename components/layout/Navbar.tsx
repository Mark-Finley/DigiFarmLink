"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sprout, ShoppingBag, LayoutDashboard, LogOut, User, Loader2, ShoppingCart } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { useCart } from "@/hooks/useCart";

interface AuthUser {
  authenticated: boolean;
  email?: string;
  role?: string;
  name?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<AuthUser>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const { cartCount } = useCart();

  // Fetch session data client-side from the server proxy endpoint
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to load navbar session:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();

    // Listen to cart / auth refresh events if triggered locally
    const handleRefresh = () => {
      fetchSession();
    };
    window.addEventListener("farmlink_auth_updated", handleRefresh);
    return () => {
      window.removeEventListener("farmlink_auth_updated", handleRefresh);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2 text-primary font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity">
            <Sprout className="h-6 w-6 animate-pulse" />
            <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">DigiFarmLink Ghana</span>
          </Link>

          {/* Center Links (Common) */}
          <div className="hidden md:flex space-x-8">
            <Link href="/marketplace" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4" />
              Browse Produce
            </Link>
            <a href="/#how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="/#stats" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Impact Metric
            </a>
            <a href="/#faqs" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              FAQs
            </a>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-xl transition-all"
              title="View Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-card shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>
            {loading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : user.authenticated ? (
              <div className="flex items-center space-x-3">
                {/* Dashboard Shortcut */}
                <Link
                  href={`/dashboard/${user.role}`}
                  className="hidden sm:flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>

                {/* User Info & Signout form */}
                <div className="flex items-center space-x-2 border-l pl-3">
                  <span className="hidden lg:inline text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    {user.name || user.email?.split("@")[0]}
                  </span>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-bold text-muted-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-muted transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all border border-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
