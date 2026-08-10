import { createRateLimiter } from "@@/server/services/rateLimiter/createRateLimiter";

// Asset requests are not API calls and cannot share their budget: one rendered page issues one request per
// Embedded asset, and every anonymous viewer behind a corporate NAT or a carrier CGNAT arrives on one egress
// Address, so the traffic on a single key is renders x assets x viewers. At the procedure budget a couple of
// Dozen page loads a minute from one office exhausts it and every viewer there sees a page of broken images.
// No blockDuration for the same reason: the sliding window has to let a burst recover on its own rather than
// Locking out an address — and everything it guards is a published page anyone may read anyway.
export const assetRateLimiter = createRateLimiter({ points: 10_000 });
