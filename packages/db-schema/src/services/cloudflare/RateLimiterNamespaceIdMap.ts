import { CloudflareEnvironment } from "#src/models/cloudflare/CloudflareEnvironment";
import { RateLimiterBinding } from "#src/models/cloudflare/RateLimiterBinding";

// The namespace each rate limiter's counters live in. Bindings sharing a namespace share counts for a key, so every binding has
// Its own, and dev and prod never share one. An id is not a secret and never changes, so it is committed like the database ids
export const RateLimiterNamespaceIdMap = {
  [CloudflareEnvironment.Development]: {
    [RateLimiterBinding.Address]: "2001",
    [RateLimiterBinding.Asset]: "2002",
    [RateLimiterBinding.Auth]: "2003",
    [RateLimiterBinding.Slow]: "2004",
    [RateLimiterBinding.Standard]: "2005",
    [RateLimiterBinding.Webhook]: "2006",
  },
  [CloudflareEnvironment.Production]: {
    [RateLimiterBinding.Address]: "1001",
    [RateLimiterBinding.Asset]: "1002",
    [RateLimiterBinding.Auth]: "1003",
    [RateLimiterBinding.Slow]: "1004",
    [RateLimiterBinding.Standard]: "1005",
    [RateLimiterBinding.Webhook]: "1006",
  },
} as const satisfies Record<CloudflareEnvironment, Record<RateLimiterBinding, string>>;
