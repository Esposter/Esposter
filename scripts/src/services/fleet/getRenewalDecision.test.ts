import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";

import { RenewalDecision } from "#src/models/fleet/RenewalDecision";
import { getRenewalDecision } from "#src/services/fleet/getRenewalDecision";
import { describe, expect, test } from "vitest";

describe(getRenewalDecision, () => {
  const HOLDER = { machine: "pc", worker: "7f3a" };
  const createClaim = (overrides: Partial<ClaimedRef["message"]>): ClaimedRef => ({
    message: {
      claimedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
      entry: "first",
      load: "",
      machine: HOLDER.machine,
      renewedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
      worker: HOLDER.worker,
      ...overrides,
    },
    sha: "a".repeat(40),
  });

  test("renews a claim this worker still holds", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(createClaim({}), HOLDER)).toBe(RenewalDecision.Renew);
  });

  test("stops when the claim's ref is gone", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(undefined, HOLDER)).toBe(RenewalDecision.Deleted);
  });

  test("stops when the claim is a miss, however it was taken", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(createClaim({ miss: "3 of 5" }), HOLDER)).toBe(RenewalDecision.Missed);
  });

  test("stops when another machine holds the claim", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(createClaim({ machine: "macbook" }), HOLDER)).toBe(RenewalDecision.TakenOver);
  });

  test("stops when another worker of the same machine holds the claim", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(createClaim({ worker: "9c01" }), HOLDER)).toBe(RenewalDecision.TakenOver);
  });
});
