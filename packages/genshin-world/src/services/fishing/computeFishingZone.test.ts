import { computeFishingZone } from "#src/services/fishing/computeFishingZone";
import { describe, expect, test } from "vitest";

describe(computeFishingZone, () => {
  const TRAVEL = { duration: 2, offset: 10, speed: 25, width: 36 };

  test("a zone starts at its offset and moves at its speed for its duration", () => {
    expect.hasAssertions();

    expect(computeFishingZone(TRAVEL, 1)).toStrictEqual({ start: 35, width: 36 });
  });

  test("a zone holds where its duration leaves it", () => {
    expect.hasAssertions();

    expect(computeFishingZone(TRAVEL, 5).start).toBe(60);
  });

  test("a zone is kept within the bar at its width", () => {
    expect.hasAssertions();

    expect(computeFishingZone({ ...TRAVEL, offset: 80, speed: 50 }, 2).start).toBe(64);
  });
});
