import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { ClaimStatus } from "#src/models/fleet/ClaimStatus";
import { STALE_MILLISECONDS } from "#src/services/fleet/constants";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";
import { describe, expect, test } from "vitest";

const RENEWED_AT = Temporal.Instant.fromEpochMilliseconds(0).toString();
const RENEWED_MILLISECONDS = Temporal.Instant.from(RENEWED_AT).epochMilliseconds;
const createClaim = (overrides: Partial<ClaimMessage>): ClaimMessage => ({
  claimedAt: RENEWED_AT,
  entry: "city-areas",
  load: "",
  machine: "pc",
  renewedAt: RENEWED_AT,
  worker: "7f3a",
  ...overrides,
});

describe(getClaimStatus, () => {
  test("reads a claim renewed within the stale interval as held", () => {
    expect.hasAssertions();

    expect(getClaimStatus(createClaim({}), RENEWED_MILLISECONDS + STALE_MILLISECONDS)).toBe(ClaimStatus.Held);
  });

  test("reads a claim unrenewed past the stale interval as stale", () => {
    expect.hasAssertions();

    expect(getClaimStatus(createClaim({}), RENEWED_MILLISECONDS + STALE_MILLISECONDS + 1)).toBe(ClaimStatus.Stale);
  });

  test("never reads a missed claim as stale, however old", () => {
    expect.hasAssertions();

    expect(getClaimStatus(createClaim({ miss: "3 of 5" }), RENEWED_MILLISECONDS + STALE_MILLISECONDS * 10)).toBe(
      ClaimStatus.Missed,
    );
  });
});
