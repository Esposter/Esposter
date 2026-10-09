import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";

import { RenewalDecision } from "#src/models/fleet/RenewalDecision";
import { getRenewalDecision } from "#src/services/fleet/getRenewalDecision";
import { describe, expect, test } from "vitest";

const MACHINE = "pc";
const createClaim = (overrides: Partial<ClaimedRef["message"]>): ClaimedRef => ({
  message: {
    claimedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
    entry: "first",
    load: "",
    machine: MACHINE,
    renewedAt: Temporal.Instant.fromEpochMilliseconds(0).toString(),
    ...overrides,
  },
  sha: "a".repeat(40),
});

describe(getRenewalDecision, () => {
  test("renews a claim this machine still holds", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(createClaim({}), MACHINE)).toBe(RenewalDecision.Renew);
  });

  test("stops when the claim's ref is gone", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(undefined, MACHINE)).toBe(RenewalDecision.Deleted);
  });

  test("stops when the claim is a miss, however it was taken", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(createClaim({ miss: "3 of 5" }), MACHINE)).toBe(RenewalDecision.Missed);
  });

  test("stops when another machine holds the claim", () => {
    expect.hasAssertions();

    expect(getRenewalDecision(createClaim({ machine: "macbook" }), MACHINE)).toBe(RenewalDecision.TakenOver);
  });
});
