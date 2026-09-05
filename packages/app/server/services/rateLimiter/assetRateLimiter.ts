import { createRateLimiter } from "@@/server/services/rateLimiter/createRateLimiter";
import { AzureContainer } from "@esposter/db-schema";

// Asset requests are not API calls and cannot share their budget: one rendered page issues one request per
// Embedded asset, and every anonymous viewer behind a corporate NAT or a carrier CGNAT arrives on one egress
// Address, so the traffic on a single key is renders x assets x viewers. At the procedure budget a couple of
// Dozen page loads a minute from one office exhausts it and every viewer there sees a page of broken images.
// Its key is a signed-in viewer's user id, the same key the procedure limiters use. No blockDuration for the
// Same reason as the budget: the sliding window has to let a burst recover on its own rather than locking out an
// Address, and everything it guards is a published page anyone may read anyway.
export const assetRateLimiter = createRateLimiter({ keyPrefix: AzureContainer.ResourceAssets, points: 10_000 });
