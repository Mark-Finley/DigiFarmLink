"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Sprout, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { showToast } from "@/components/ToastContainer";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      const errMsg = "Passwords do not match.";
      showToast(errMsg, "error");
      setError(errMsg);
      return;
    }

    const countryCode = formData.get("countryCode") as string;
    const phoneNumber = (formData.get("phoneNumber") as string || "").trim();
    const cleanPhone = phoneNumber.startsWith("0") ? phoneNumber.slice(1) : phoneNumber;
    formData.set("phone", `${countryCode}${cleanPhone}`);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (!result.success) {
        const errMsg = result.error || "An error occurred during registration.";
        showToast(errMsg, "error");
        setError(errMsg);
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
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
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
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
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
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="phone">
              Phone Number
            </label>
            <div className="flex gap-2 w-full min-w-0">
              <select
                name="countryCode"
                defaultValue="+233"
                disabled={isPending}
                className="border rounded-lg px-3 py-2 text-sm bg-background text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 shrink-0"
              >
                <option value="+233">🇬🇭 +233</option>
                <option value="+234">🇳🇬 +234</option>
                <option value="+225">🇨🇮 +225</option>
                <option value="+228">🇹🇬 +228</option>
                <option value="+231">🇱🇷 +231</option>
                <option value="+232">🇸🇱 +232</option>
                <option value="+229">🇧🇯 +229</option>
                <option value="+254">🇰🇪 +254</option>
              </select>
              <input
                id="phone"
                name="phoneNumber"
                type="tel"
                placeholder="e.g. 241000000"
                required
                disabled={isPending}
                className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm bg-background text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
            </div>
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
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
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
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="w-full border rounded-lg pl-3 pr-10 py-2 text-sm bg-background text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
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

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                disabled={isPending}
                className="w-full border rounded-lg pl-3 pr-10 py-2 text-sm bg-background text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isPending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
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
