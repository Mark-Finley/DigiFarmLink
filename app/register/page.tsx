"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Sprout, Loader2, CheckCircle } from "lucide-react";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (!result.success) {
        setError(result.error || "An error occurred during registration.");
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
        <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl border shadow-sm text-center">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-primary animate-bounce" />
            <h2 className="text-2xl font-bold tracking-tight">Registration Successful!</h2>
            <p className="text-sm text-muted-foreground">
              Your account has been created. If email verification is enabled on your Supabase instance, please check your inbox to confirm. Otherwise, you can log in immediately.
            </p>
            <Link
              href="/login"
              className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors block text-center"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl border shadow-sm">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
            <Sprout className="h-6 w-6" />
            <span>DigiFarmLink Ghana</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight mt-4">Create an Account</h2>
          <p className="text-sm text-muted-foreground">
            Select your role to join the agricultural corridor
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="role">
              I am a...
            </label>
            <select
              id="role"
              name="role"
              required
              disabled={isPending}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              <option value="farmer">Farmer (Vegetable grower)</option>
              <option value="buyer">Buyer (Commercial retailer/wholesaler)</option>
              <option value="transporter">Transport Provider (Logistics hauler)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="name">
              Full Name / Business Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Kwame Mensah"
              required
              disabled={isPending}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

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
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. +233241000000"
              required
              disabled={isPending}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="location">
              Ashanti Region Town
            </label>
            <select
              id="location"
              name="location"
              required
              disabled={isPending}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              <option value="Kumasi Central">Kumasi Central (Metropolis)</option>
              <option value="Mampong">Mampong (North)</option>
              <option value="Obuasi">Obuasi (South)</option>
              <option value="Ejura">Ejura (North-East)</option>
              <option value="Konongo">Konongo (East)</option>
              <option value="Bekwai">Bekwai (South-West)</option>
              <option value="Offinso">Offinso (West)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
