import type { ExpeditionDuration } from "#src/models/expedition/ExpeditionDuration";

import { computeExpeditionHours } from "#src/services/expedition/computeExpeditionHours";
import { describe, expect, test } from "vitest";

describe(computeExpeditionHours, () => {
  // The four lengths a Mondstadt place offers, in the order its table holds them
  const DURATIONS: ExpeditionDuration[] = [4, 8, 12, 20].map((hours) => ({ hours, items: [] }));

  test("a length picked that the place offers is kept", () => {
    expect.hasAssertions();

    expect(computeExpeditionHours(DURATIONS, 12)).toBe(12);
  });

  test("no length picked is the place's first length", () => {
    expect.hasAssertions();

    expect(computeExpeditionHours(DURATIONS, 0)).toBe(4);
  });

  test("a length picked that the place does not offer is the place's first length", () => {
    expect.hasAssertions();

    expect(computeExpeditionHours([{ hours: 8, items: [] }], 20)).toBe(8);
  });
});
