import { useState, useCallback, useEffect } from "react";
import type { Currency, BillingInterval } from "@/lib/pricing.ts";

const CURRENCY_STORAGE_KEY = "flowora_preferred_currency";

/**
 * Hook for managing currency and billing interval preferences.
 * Persists currency preference to localStorage and auto-detects based on timezone.
 */
export function usePricing() {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored === "INR" || stored === "USD") return stored;

    // Auto-detect based on timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) {
        return "INR";
      }
    } catch {
      // Fallback
    }

    return "USD";
  });

  const [billingInterval, setBillingInterval] = useState<BillingInterval>("annual");

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_STORAGE_KEY, c);
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(currency === "USD" ? "INR" : "USD");
  }, [currency, setCurrency]);

  const toggleBillingInterval = useCallback(() => {
    setBillingInterval((prev) => (prev === "monthly" ? "annual" : "monthly"));
  }, []);

  return {
    currency,
    setCurrency,
    toggleCurrency,
    billingInterval,
    setBillingInterval,
    toggleBillingInterval,
  };
}

/**
 * Hook to detect user's likely country/currency from browser APIs.
 */
export function useDetectedCurrency(): Currency {
  const [detected, setDetected] = useState<Currency>("USD");

  useEffect(() => {
    try {
      const locale = navigator.language || "en-US";
      if (locale.includes("IN") || locale === "hi" || locale.startsWith("hi-")) {
        setDetected("INR");
      }
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Kolkata") || tz.includes("Calcutta")) {
        setDetected("INR");
      }
    } catch {
      // Keep USD default
    }
  }, []);

  return detected;
}
