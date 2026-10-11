import type { RateLimiterStore } from "#src/models/RateLimiterStore";
import type { RateLimitWindow } from "#src/models/RateLimitWindow";

// The counts live in this process, so each instance of a scaled-out app keeps its own.
// A key that has not been seen, or whose window has ended, starts a new window.
// Past `maxEntries` the least recently counted key is dropped, which bounds the memory a flood of keys can take
export const createInMemoryRateLimiterStore = (maxEntries: number): RateLimiterStore => {
  const windows = new Map<string, RateLimitWindow>();

  return {
    increment: async (key, intervalInMilliseconds) => {
      const now = Date.now();
      const current = windows.get(key);
      const window: RateLimitWindow =
        current && current.resetAt > now
          ? { count: current.count + 1, resetAt: current.resetAt }
          : { count: 1, resetAt: now + intervalInMilliseconds };

      // Deleted before it is set again, so the Map's first key is always the least recently counted
      windows.delete(key);
      windows.set(key, window);
      const [oldestKey] = windows.keys();
      if (windows.size > maxEntries && oldestKey !== undefined) windows.delete(oldestKey);

      return window;
    },
  };
};
