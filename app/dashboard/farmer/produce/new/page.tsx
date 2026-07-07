"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout, ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { createProduceAction } from "@/app/actions/produce";

export default function NewProducePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    if (typeof window !== "undefined" && !navigator.onLine) {
      const payload = {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        price: formData.get("price") as string,
        quantity: formData.get("quantity") as string,
        harvest_date: formData.get("harvest_date") as string,
        freshness: formData.get("freshness") as string,
        image_url: formData.get("image_url") as string,
      };
      
      const { queueOfflineAction } = require("@/hooks/useOfflineSync");
      queueOfflineAction("create_produce", payload);
      
      router.push("/dashboard/farmer");
      router.refresh();
      return;
    }

    startTransition(async () => {
      const result = await createProduceAction(formData);
      if (!result.success) {
        setError(result.error || "Failed to create crop listing.");
      } else {
        const { showToast } = require("@/components/ToastContainer");
        showToast("Crop listing published successfully!", "success");
        router.push("/dashboard/farmer");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="font-extrabold text-lg text-primary">Farmer Portal</span>
        </div>
        <Link
          href="/dashboard/farmer"
          className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </header>

      {/* Form Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              List New Produce Batch
            </h1>
            <p className="text-sm text-muted-foreground">
              Add your vegetable batch to the Ashanti corridor supply marketplace.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Produce Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Produce Name / Batch Title
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Kumasi Red Round Tomatoes"
                required
                className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Crop Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20"
                >
                  <option value="Tomatoes">Tomatoes</option>
                  <option value="Pepper">Pepper</option>
                  <option value="Garden Eggs">Garden Eggs (Eggplant)</option>
                  <option value="Okra">Okra</option>
                  <option value="Cabbage">Cabbage</option>
                  <option value="Lettuce">Lettuce</option>
                  <option value="Spinach">Spinach</option>
                  <option value="Onions">Onions</option>
                </select>
              </div>

              {/* Freshness Tier */}
              <div className="space-y-1.5">
                <label htmlFor="freshness" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Freshness Score
                </label>
                <select
                  id="freshness"
                  name="freshness"
                  required
                  className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20"
                >
                  <option value="Fresh">Freshly Harvested (Highest Grade)</option>
                  <option value="Good">Good Quality (Standard)</option>
                  <option value="Fair">Fair / Ripening</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Price per unit */}
              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="price" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Price (GHS / bag)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Price in GHS"
                  required
                  className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="quantity" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Quantity Available
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="Total bags"
                  required
                  className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20"
                />
              </div>

              {/* Harvest Date */}
              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="harvest_date" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Harvest Date
                </label>
                <input
                  id="harvest_date"
                  name="harvest_date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20"
                />
              </div>
            </div>

            {/* Optional Image URL */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="image_url" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Produce Cover Image URL
                </label>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">(Optional)</span>
              </div>
              <input
                id="image_url"
                name="image_url"
                type="url"
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-muted/20"
              />
              <p className="text-[11px] text-muted-foreground italic">
                Leave empty to automatically assign a stunning stock photo matching the selected category!
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Link
                href="/dashboard/farmer"
                className="w-1/3 text-center py-3 border rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="w-2/3 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all text-sm border border-primary flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Create Listing</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 text-center text-xs text-muted-foreground mt-12">
        <p>&copy; {new Date().getFullYear()} DigiFarmLink Ghana. Farmer Panel Workspace.</p>
      </footer>
    </div>
  );
}
