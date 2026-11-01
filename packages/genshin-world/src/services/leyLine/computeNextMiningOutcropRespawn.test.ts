import { computeNextMiningOutcropRespawn } from "#src/services/leyLine/computeNextMiningOutcropRespawn";
import { MINING_OUTCROP_RESPAWN } from "#src/services/leyLine/constants.test";
import { describe, expect, test } from "vitest";

describe(computeNextMiningOutcropRespawn, () => {
  test("no mined outcrop leaves no respawn to come", () => {
    expect.hasAssertions();
    expect(computeNextMiningOutcropRespawn([], MINING_OUTCROP_RESPAWN)).toBeUndefined();
  });

  test("the earliest respawn still to come is the next one, and a respawn already past is not", () => {
    expect.hasAssertions();
    const minedAts = [
      MINING_OUTCROP_RESPAWN.subtract({ hours: 30 }),
      MINING_OUTCROP_RESPAWN.subtract({ hours: 1 }),
      MINING_OUTCROP_RESPAWN.add({ hours: 1 }),
    ];
    expect(
      computeNextMiningOutcropRespawn(minedAts, MINING_OUTCROP_RESPAWN.subtract({ hours: 2 }))?.epochMilliseconds,
    ).toBe(MINING_OUTCROP_RESPAWN.epochMilliseconds);
    expect(computeNextMiningOutcropRespawn(minedAts, MINING_OUTCROP_RESPAWN)?.epochMilliseconds).toBe(
      MINING_OUTCROP_RESPAWN.add({ hours: 24 }).epochMilliseconds,
    );
  });
});
