"use client";

import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function OfflineSyncManager() {
  // Mounts the hook to listen to browser events globally in the background
  useOfflineSync();
  return null;
}
