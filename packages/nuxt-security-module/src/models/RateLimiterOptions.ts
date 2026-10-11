// The requests one key may make in one window. The request past that count is refused with `429`
export interface RateLimiterOptions {
  intervalInMilliseconds: number;
  tokensPerInterval: number;
}
