"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Sprout, Loader2, Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (!result.success) {
        setError(result.error || "Invalid login credentials.");
      } else {
        // Successful login, direct redirection to dashboard
        window.location.href = `/dashboard/${result.role}`;
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl border shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
            <Sprout className="h-6 w-6" />
            <span>DigiFarmLink Ghana</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight mt-4">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to access your DigiFarmLink account
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              disabled={isPending}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="w-full border rounded-lg pl-3 pr-10 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
