import type { Expedition } from "#src/models/expedition/Expedition";

import { checkIsExpeditionReturned } from "#src/services/expedition/checkIsExpeditionReturned";
import { describe, expect, test } from "vitest";

describe(checkIsExpeditionReturned, () => {
  const HOURS = 4;
  const leftAt = Temporal.Instant.fromEpochMilliseconds(0);
  const expedition: Expedition = { characterId: 10_000_001, hours: HOURS, leftAt, placeId: 101 };
  const returnedAt = leftAt.add({ hours: HOURS });

  test("should hold an expedition out until its hours have passed", () => {
    expect.hasAssertions();

    expect(checkIsExpeditionReturned(expedition, returnedAt.subtract({ nanoseconds: 1 }))).toBe(false);
  });

  test("should return an expedition at the moment its hours have passed", () => {
    expect.hasAssertions();

    expect(checkIsExpeditionReturned(expedition, returnedAt)).toBe(true);
  });
});
