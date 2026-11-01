import { checkIsBossHeld } from "#src/services/bosses/checkIsBossHeld";
import { describe, expect, test } from "vitest";

describe(checkIsBossHeld, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const AREA_ID = "1";
  const OTHER_AREA_ID = "2";
  // The landing outside every area, under the empty id
  const NO_AREA_ID = "";

  test("a boss with no teleport since its defeat is held", () => {
    expect.hasAssertions();

    expect(checkIsBossHeld(AREA_ID, epoch, new Map<string, Temporal.Instant>())).toBe(true);
  });

  test("a teleport landing in its own area after its defeat leaves it held", () => {
    expect.hasAssertions();

    expect(checkIsBossHeld(AREA_ID, epoch, new Map([[AREA_ID, epoch.add({ seconds: 1 })]]))).toBe(true);
  });

  test("a teleport landing outside its area after its defeat releases it", () => {
    expect.hasAssertions();

    const teleportedAt = epoch.add({ seconds: 1 });

    expect(checkIsBossHeld(AREA_ID, epoch, new Map([[OTHER_AREA_ID, teleportedAt]]))).toBe(false);
    expect(checkIsBossHeld(AREA_ID, epoch, new Map([[NO_AREA_ID, teleportedAt]]))).toBe(false);
  });

  test("a teleport landing outside its area before its defeat does not release it", () => {
    expect.hasAssertions();

    expect(checkIsBossHeld(AREA_ID, epoch, new Map([[OTHER_AREA_ID, epoch.subtract({ seconds: 1 })]]))).toBe(true);
  });
});
