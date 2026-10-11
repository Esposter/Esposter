// The count of one key's requests in its current window, and the epoch milliseconds at which the window ends
export interface RateLimitWindow {
  count: number;
  resetAt: number;
}
