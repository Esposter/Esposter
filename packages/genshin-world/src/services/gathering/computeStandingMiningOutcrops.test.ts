import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { computeStandingMiningOutcrops } from "#src/services/gathering/computeStandingMiningOutcrops";
import { describe, expect, test } from "vitest";

const drawnAt = (at: Temporal.Instant) => ({ at, placeIds: ["a", "b"] });

describe(computeStandingMiningOutcrops, () => {
  // The draws, 06:00 in UTC+8 on two game days: 22:00 UTC of the day before each day, counted from the epoch
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const drawDay1 = epoch.add({ hours: 480_000 }).subtract({ hours: 2 });
  const drawDay2 = drawDay1.add({ hours: 24 });
  const places: GatheringPlace[] = [
    { id: "a", kind: 101_004, position: { x: 0, z: 0 } },
    { id: "b", kind: 101_004, position: { x: 1, z: 1 } },
  ];

  test("outcrops appear at 06:00 with the day's draw", () => {
    expect.hasAssertions();
    expect(computeStandingMiningOutcrops(places, undefined, new Map(), drawDay1)).toStrictEqual([]);
    expect(computeStandingMiningOutcrops(places, drawnAt(drawDay1), new Map(), drawDay1)).toStrictEqual(places);
  });

  test("the previous day's draw stands from the 04:00 reset until the 06:00 draw", () => {
    expect.hasAssertions();
    expect(
      computeStandingMiningOutcrops(places, drawnAt(drawDay1), new Map(), drawDay2.subtract({ hours: 2 })),
    ).toStrictEqual(places);
    expect(
      computeStandingMiningOutcrops(places, drawnAt(drawDay1), new Map(), drawDay2.subtract({ minutes: 1 })),
    ).toStrictEqual(places);
    expect(computeStandingMiningOutcrops(places, drawnAt(drawDay1), new Map(), drawDay2)).toStrictEqual([]);
  });

  test("a mined outcrop is gone for the day", () => {
    expect.hasAssertions();
    const minedAt = new Map([["a", drawDay1.add({ hours: 6 })]]);
    const now = drawDay1.add({ hours: 11 });

    expect(computeStandingMiningOutcrops(places, drawnAt(drawDay1), minedAt, now)).toStrictEqual([places[1]]);
  });

  test("an unmined outcrop is gone at the next day's draw", () => {
    expect.hasAssertions();
    expect(computeStandingMiningOutcrops(places, drawnAt(drawDay1), new Map(), drawDay2)).toStrictEqual([]);
  });

  test("a mined outcrop stands again at its 06:00 respawn, which the next day's draw comes with", () => {
    expect.hasAssertions();
    const minedAt = new Map([["a", drawDay1.add({ hours: 6 })]]);

    expect(
      computeStandingMiningOutcrops(places, drawnAt(drawDay1), minedAt, drawDay2.subtract({ minutes: 1 })),
    ).toStrictEqual([places[1]]);
    expect(computeStandingMiningOutcrops(places, drawnAt(drawDay2), minedAt, drawDay2)).toStrictEqual(places);
  });
});
