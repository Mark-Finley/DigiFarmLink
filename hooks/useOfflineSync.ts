"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/ToastContainer";
import { createProduceAction } from "@/app/actions/produce";
import { checkoutAction } from "@/app/actions/orders";

export interface OfflineAction {
  id: string;
  action: "create_produce" | "checkout";
  payload: any;
  timestamp: number;
}

export function queueOfflineAction(action: "create_produce" | "checkout", payload: any) {
  try {
    const queueStr = localStorage.getItem("farmlink_offline_queue") || "[]";
    const queue: OfflineAction[] = JSON.parse(queueStr);

    const newItem: OfflineAction = {
      id: Math.random().toString(36).slice(2, 9),
      action,
      payload,
      timestamp: Date.now(),
    };

    queue.push(newItem);
    localStorage.setItem("farmlink_offline_queue", JSON.stringify(queue));
    
    showToast(
      action === "create_produce" 
        ? "Crop saved to offline queue. It will publish automatically when connection returns!"
        : "Checkout cached offline. Your orders will submit once you are back online!",
      "info"
    );
  } catch (err) {
    console.error("Failed to queue offline request:", err);
  }
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      showToast("Connection restored. Syncing offline data...", "info");

      try {
        const queueStr = localStorage.getItem("farmlink_offline_queue") || "[]";
        const queue: OfflineAction[] = JSON.parse(queueStr);

        if (queue.length === 0) {
          showToast("No pending offline actions to sync.", "success");
          return;
        }

        let syncedCount = 0;

        for (const item of queue) {
          if (item.action === "create_produce") {
            const formData = new FormData();
            Object.entries(item.payload).forEach(([key, value]) => {
              formData.append(key, value as string);
            });
            const result = await createProduceAction(formData);
            if (result.success) syncedCount++;
          } else if (item.action === "checkout") {
            const result = await checkoutAction(item.payload);
            if (result.success) syncedCount++;
          }
        }

        localStorage.removeItem("farmlink_offline_queue");

        if (syncedCount > 0) {
          showToast(`Successfully synced ${syncedCount} offline operation(s)!`, "success");
          window.location.reload();
        }
      } catch (err) {
        console.error("Failed to sync offline items:", err);
        showToast("Error syncing offline queue. Will try again later.", "error");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast("Network connection lost. Running in offline mode.", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
