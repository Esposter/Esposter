/* eslint-disable vitest/require-top-level-describe */
import { describe, vi } from "vitest";
// The shared navigator.onLine simulation for offline/online cache and subscribable tests.
export const goOffline = () => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
  window.dispatchEvent(new Event("offline"));
};

export const goOnline = () => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  window.dispatchEvent(new Event("online"));
};

describe.todo("network");
