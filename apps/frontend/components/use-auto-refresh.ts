"use client";

import { useEffect } from "react";

type AutoRefreshOptions = {
  intervalMs?: number;
  enabled?: boolean;
};

const DEFAULT_INTERVAL_MS = 30000;

export function useAutoRefresh(
  refresh: () => Promise<void> | void,
  { intervalMs = DEFAULT_INTERVAL_MS, enabled = true }: AutoRefreshOptions = {}
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let inFlight = false;

    function runRefresh() {
      if (inFlight) {
        return;
      }

      inFlight = true;

      Promise.resolve(refresh())
        .catch(() => undefined)
        .finally(() => {
          inFlight = false;
        });
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        runRefresh();
      }
    }

    runRefresh();

    const intervalId = window.setInterval(refreshWhenVisible, intervalMs);

    window.addEventListener("focus", runRefresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", runRefresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [enabled, intervalMs, refresh]);
}
