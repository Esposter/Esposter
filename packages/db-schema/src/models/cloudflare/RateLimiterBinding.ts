// The binding each rate limiter is served by, named as the web Worker's wrangler configuration declares it. A binding
// Counts in a namespace of its own, a key's count is kept within one, and the keys of two limiters are not prefixed,
// So two limiters on one binding would count each other's calls against a single budget. Each limiter therefore has
// A binding of its own, even where two budgets match
export const RateLimiterBinding = {
  Address: "RATE_LIMITER_ADDRESS",
  Asset: "RATE_LIMITER_ASSET",
  Auth: "RATE_LIMITER_AUTH",
  Slow: "RATE_LIMITER_SLOW",
  Standard: "RATE_LIMITER_STANDARD",
  Webhook: "RATE_LIMITER_WEBHOOK",
} as const;
export type RateLimiterBinding = (typeof RateLimiterBinding)[keyof typeof RateLimiterBinding];
