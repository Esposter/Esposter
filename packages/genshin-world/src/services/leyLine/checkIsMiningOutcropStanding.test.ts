import { checkIsMiningOutcropStanding } from "#src/services/leyLine/checkIsMiningOutcropStanding";
import { MINING_OUTCROP_RESPAWN } from "#src/services/leyLine/constants.test";
import { describe, expect, test } from "vitest";

describe(checkIsMiningOutcropStanding, () => {
  test("a mining outcrop not mined stands", () => {
    expect.hasAssertions();
    expect(checkIsMiningOutcropStanding(undefined, MINING_OUTCROP_RESPAWN)).toBe(true);
  });

  test("a mining outcrop mined after the day's draw and before 06:00 stands again at 06:00", () => {
    expect.hasAssertions();
    const minedAt = MINING_OUTCROP_RESPAWN.subtract({ hours: 1 });
    expect(checkIsMiningOutcropStanding(minedAt, MINING_OUTCROP_RESPAWN.subtract({ seconds: 1 }))).toBe(false);
    expect(checkIsMiningOutcropStanding(minedAt, MINING_OUTCROP_RESPAWN)).toBe(true);
  });

  test("a mining outcrop mined at 06:00 is gone until the next 06:00, and stands from it", () => {
    expect.hasAssertions();
    const minedAt = MINING_OUTCROP_RESPAWN;
    const nextRespawn = MINING_OUTCROP_RESPAWN.add({ hours: 24 });
    expect(checkIsMiningOutcropStanding(minedAt, nextRespawn.subtract({ seconds: 1 }))).toBe(false);
    expect(checkIsMiningOutcropStanding(minedAt, nextRespawn)).toBe(true);
  });
});
