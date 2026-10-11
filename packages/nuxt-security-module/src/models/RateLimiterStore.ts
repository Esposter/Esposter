import type { RateLimitWindow } from "#src/models/RateLimitWindow";

// Counts one request under a key and returns that key's window once the request is counted.
// A store that keeps its counts outside the process implements this same method
export interface RateLimiterStore {
  increment(key: string, intervalInMilliseconds: number): Promise<RateLimitWindow>;
}
