"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2 } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
}

interface AdminAnalyticsProps {
  categoryData: CategoryData[];
}

const COLORS = [
  "#10b981", // Tomatoes (Emerald)
  "#f59e0b", // Pepper (Amber)
  "#8b5cf6", // Garden Eggs (Purple)
  "#ec4899", // Okra (Pink)
  "#3b82f6", // Cabbage (Blue)
  "#14b8a6", // Lettuce (Teal)
  "#6366f1", // Spinach (Indigo)
  "#a855f7", // Onions (Purple Accent)
];

export default function AdminAnalytics({ categoryData }: AdminAnalyticsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-72 bg-slate-50 border rounded-xl flex items-center justify-center text-xs text-muted-foreground font-semibold">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading analytics charts...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-extrabold text-sm uppercase text-slate-700 tracking-wider">
        Listed Crops by Category
      </h3>
      <div className="w-full h-72 bg-slate-50/50 border rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
