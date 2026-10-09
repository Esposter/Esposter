// One quota in GitHub's `rate_limit` answer, its own spelling: what is left of it, and when it resets, in UTC epoch
// Seconds — the value a refused request's `x-ratelimit-reset` header carries
export interface RateLimitResource {
  remaining: number;
  reset: number;
}
