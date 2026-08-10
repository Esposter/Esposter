import { assetRateLimiter } from "@@/server/services/rateLimiter/assetRateLimiter";
import { createRateLimiter } from "@@/server/services/rateLimiter/createRateLimiter";
import { slowRateLimiter } from "@@/server/services/rateLimiter/slowRateLimiter";
import { standardRateLimiter } from "@@/server/services/rateLimiter/standardRateLimiter";
import { webhookRateLimiter } from "@@/server/services/rateLimiter/webhookRateLimiter";
import { describe, expect, test } from "vitest";

describe(createRateLimiter, () => {
  test("gives every limiter its own keyspace in the shared table", () => {
    expect.hasAssertions();

    // Two limiters sharing a prefix share a counter row for every key they have in common, and the pairs that
    // Collide are the ones nobody notices: both procedure limiters key an authed caller on the bare user id,
    // And the asset limiter keys a signed-in viewer on that same id
    const keyPrefixes = [assetRateLimiter, slowRateLimiter, standardRateLimiter, webhookRateLimiter].map(
      ({ keyPrefix }) => keyPrefix,
    );

    expect(new Set(keyPrefixes).size).toBe(keyPrefixes.length);
  });
});
