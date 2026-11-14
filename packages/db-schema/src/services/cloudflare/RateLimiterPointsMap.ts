import { RateLimiterBinding } from "#src/models/cloudflare/RateLimiterBinding";

// The points one key may spend per window, by the binding that counts it. A binding's limit is set from this in the web
// Worker's wrangler configuration, and the API key plugin reads the standard budget from here, so the number is written once
export const RateLimiterPointsMap = {
  [RateLimiterBinding.Address]: 10_000,
  [RateLimiterBinding.Asset]: 10_000,
  [RateLimiterBinding.Auth]: 1000,
  [RateLimiterBinding.Slow]: 100,
  [RateLimiterBinding.Standard]: 1000,
  [RateLimiterBinding.Webhook]: 30,
} as const satisfies Record<RateLimiterBinding, number>;
