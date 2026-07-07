"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, Wifi, WifiOff } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export function showToast(message: string, type: "success" | "error" | "info" = "success") {
  const event = new CustomEvent("farmlink_toast", {
    detail: { message, type },
  });
  window.dispatchEvent(event);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: "success" | "error" | "info" }>;
      const newToast: ToastMessage = {
        id: Math.random().toString(36).slice(2, 9),
        message: customEvent.detail.message,
        type: customEvent.detail.type,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener("farmlink_toast", handleToastEvent);
    return () => {
      window.removeEventListener("farmlink_toast", handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl border shadow-lg flex items-start justify-between gap-3 pointer-events-auto animate-slide-in transition-all bg-card/95 backdrop-blur-[2px] ${
            toast.type === "success" ? "border-emerald-200 text-slate-800" :
            toast.type === "error" ? "border-destructive/20 text-destructive" :
            "border-blue-200 text-slate-800"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
            {toast.type === "info" && <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}
            
            <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
