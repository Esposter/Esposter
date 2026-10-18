import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { computeStandingMiningOutcrops } from "#src/services/gathering/computeStandingMiningOutcrops";
import { describe, expect, test } from "vitest";

// The resets, 04:00 in UTC+8 on two game days: 20:00 UTC of the day before each day, counted from the epoch
const epoch = Temporal.Instant.fromEpochMilliseconds(0);
const resetDay1 = epoch.add({ hours: 480_000 }).subtract({ hours: 4 });
const resetDay2 = resetDay1.add({ hours: 24 });
const places: GatheringPlace[] = [
  { id: "a", kind: 101_004, position: { x: 0, z: 0 } },
  { id: "b", kind: 101_004, position: { x: 1, z: 1 } },
];
const drawnAt = (at: Temporal.Instant) => ({ at, placeIds: ["a", "b"] });

describe(computeStandingMiningOutcrops, () => {
  test("outcrops appear at 04:00 with the day's draw", () => {
    expect.hasAssertions();
    expect(computeStandingMiningOutcrops(places, undefined, new Map(), resetDay1)).toStrictEqual([]);
    expect(computeStandingMiningOutcrops(places, drawnAt(resetDay1), new Map(), resetDay1)).toStrictEqual(places);
  });

  test("a mined outcrop is gone for the day", () => {
    expect.hasAssertions();
    const minedAt = new Map([["a", resetDay1.add({ hours: 6 })]]);
    const now = resetDay1.add({ hours: 11 });
    expect(computeStandingMiningOutcrops(places, drawnAt(resetDay1), minedAt, now)).toStrictEqual([places[1]]);
  });

  test("an unmined outcrop is gone at the next day's draw", () => {
    expect.hasAssertions();
    expect(computeStandingMiningOutcrops(places, drawnAt(resetDay1), new Map(), resetDay2)).toStrictEqual([]);
  });

  test("a mined outcrop stands again from the next day's draw", () => {
    expect.hasAssertions();
    const minedAt = new Map([["a", resetDay1.add({ hours: 6 })]]);
    expect(computeStandingMiningOutcrops(places, drawnAt(resetDay2), minedAt, resetDay2)).toStrictEqual(places);
  });
});
