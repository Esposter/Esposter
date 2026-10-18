import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { landKitHits } from "#src/services/kit/landKitHits";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const COMBATANT: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
};
const HIT_AREA = { angle: 2 * Math.PI, height: 2, radius: 2.5 };
const createHit = (hitmarkSeconds: number, landsWhen?: KitHit["landsWhen"]): KitHit => ({
  hitArea: HIT_AREA,
  hitmarkSeconds,
  landsWhen,
  poiseDamage: 0,
  talentMultiplier: 1,
});

describe(landKitHits, () => {
  test("lands every hit whose hitmark has fallen, in order, and returns the index of the next", () => {
    expect.hasAssertions();
    const hits = [createHit(0.5), createHit(1), createHit(2)];
    const landedHits: KitHit[] = [];
    const nextHitIndex = landKitHits(hits, 0, 1, landedHits, createKitTestContext(COMBATANT));
    expect(landedHits).toStrictEqual(hits.slice(0, 2));
    expect(nextHitIndex).toBe(2);
  });

  test("skips a hit whose landing condition does not hold, and still lands the hits after it", () => {
    expect.hasAssertions();
    const first = createHit(0.5);
    const gated = createHit(0.6, () => false);
    const last = createHit(0.7);
    const landedHits: KitHit[] = [];
    const nextHitIndex = landKitHits([first, gated, last], 0, 1, landedHits, createKitTestContext(COMBATANT));
    expect(landedHits).toStrictEqual([first, last]);
    expect(nextHitIndex).toBe(3);
  });

  test("gives a hit's landing condition the context it lands in", () => {
    expect.hasAssertions();
    const context: KitContext = createKitTestContext(COMBATANT);
    let seenContext: KitContext | undefined;
    const hit = createHit(0.5, (landingContext) => {
      seenContext = landingContext;
      return true;
    });
    landKitHits([hit], 0, 1, [], context);
    expect(seenContext).toBe(context);
  });
});
