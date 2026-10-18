import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { computeDailyMiningOutcrops } from "#src/services/gathering/computeDailyMiningOutcrops";
import { describe, expect, test } from "vitest";

describe(computeDailyMiningOutcrops, () => {
  const places: GatheringPlace[] = Array.from({ length: 10 }, (_, index) => ({
    id: `place-${index}`,
    kind: 101_004,
    position: { x: index, z: index },
  }));
  const placeIds = places.map(({ id }) => id);

  test("no outcrops appear below Adventure Rank 30", () => {
    expect.hasAssertions();
    expect(computeDailyMiningOutcrops("mondstadt", placeIds, 29, () => 0)).toStrictEqual([]);
    expect(computeDailyMiningOutcrops("mondstadt", placeIds, 30, () => 0)).toHaveLength(6);
  });

  test("a region draws its count of distinct places, Liyue's ten", () => {
    expect.hasAssertions();
    const drawn = computeDailyMiningOutcrops("liyue", placeIds, 30, () => 0.5);
    expect(drawn).toHaveLength(10);
    expect(new Set(drawn)).toStrictEqual(new Set(placeIds));
  });

  test("a region with fewer places than its count draws every place it has", () => {
    expect.hasAssertions();
    expect(computeDailyMiningOutcrops("mondstadt", placeIds.slice(0, 3), 30, () => 0.9)).toHaveLength(3);
  });

  test("a region the wiki gives no count for draws the default count", () => {
    expect.hasAssertions();
    expect(computeDailyMiningOutcrops("fontaine", placeIds, 30, () => 0.2)).toHaveLength(6);
  });
});
