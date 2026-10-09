import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";

import { ClaimDecision } from "#src/models/fleet/ClaimDecision";
import { STALE_MILLISECONDS } from "#src/services/fleet/constants";
import { getClaimDecision } from "#src/services/fleet/getClaimDecision";
import { describe, expect, test } from "vitest";

const NOW = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).epochMilliseconds;
const RECENT = Temporal.Instant.fromEpochMilliseconds(NOW).subtract({ minutes: 5 }).toString();
const OLD = Temporal.Instant.fromEpochMilliseconds(NOW - STALE_MILLISECONDS - 1).toString();
const HOLDER = { machine: "pc", worker: "7f3a" };
const createClaim = (holder: typeof HOLDER, renewedAt: string): ClaimedRef => ({
  message: { claimedAt: RECENT, entry: "first", load: "", machine: holder.machine, renewedAt, worker: holder.worker },
  sha: "a".repeat(40),
});

describe(getClaimDecision, () => {
  test("takes an entry no claim holds", () => {
    expect.hasAssertions();

    expect(getClaimDecision(undefined, HOLDER, NOW)).toBe(ClaimDecision.Take);
  });

  test("adopts a live claim this worker holds itself", () => {
    expect.hasAssertions();

    expect(getClaimDecision(createClaim(HOLDER, RECENT), HOLDER, NOW)).toBe(ClaimDecision.Adopt);
  });

  test("leaves a live claim another worker on the same machine holds", () => {
    expect.hasAssertions();

    expect(getClaimDecision(createClaim({ ...HOLDER, worker: "9c01" }, RECENT), HOLDER, NOW)).toBe(ClaimDecision.Held);
  });

  test("leaves a live claim a worker written before workers holds, and takes a stale one", () => {
    expect.hasAssertions();

    expect(getClaimDecision(createClaim({ ...HOLDER, worker: "" }, RECENT), HOLDER, NOW)).toBe(ClaimDecision.Held);
    expect(getClaimDecision(createClaim(HOLDER, OLD), { ...HOLDER, worker: "9c01" }, NOW)).toBe(ClaimDecision.Take);
  });
});
