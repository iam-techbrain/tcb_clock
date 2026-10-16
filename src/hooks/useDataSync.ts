"use client";

import { useEffect, useRef } from "react";
import { postData, updateData } from "@/services/dataService";

export interface DataSyncOptions<T> {
  endpoint: string;
  data: T | null;
  method?: "POST" | "PUT";
  syncKey?: string;
  enabled?: boolean;
}

/**
 * Universal Data Sync Hook
 * Automatically posts or updates ANY data to ANY backend endpoint when the data changes.
 * Supports duplicate-prevention via syncKey or payload comparison.
 */
export function useDataSync<T>({
  endpoint,
  data,
  method = "POST",
  syncKey,
  enabled = true,
}: DataSyncOptions<T>) {
  const lastSyncSignature = useRef<string>("");

  useEffect(() => {
    if (!enabled || !data) return;

    const signature = syncKey || JSON.stringify(data);
    if (lastSyncSignature.current === signature) return;

    lastSyncSignature.current = signature;

    if (method === "PUT") {
      updateData(endpoint, data);
    } else {
      postData(endpoint, data);
    }
  }, [endpoint, data, method, syncKey, enabled]);
}
