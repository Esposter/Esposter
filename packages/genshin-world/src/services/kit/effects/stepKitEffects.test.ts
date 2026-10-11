import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe("stepKitEffects", () => {
  const COMBATANT: KitSummon["combatant"] = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };

  test.each([
    [0.25, 1],
    [0, 0],
  ])(
    "a summon with %d seconds left as the step begins lands %i of the hits due in it",
    (secondsRemaining, strikeCount) => {
      expect.hasAssertions();
      const summon: KitSummon = {
        body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
        combatant: COMBATANT,
        elapsedSeconds: 0,
        hits: [
          {
            hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
            hitmarkSeconds: 0.25,
            poiseDamage: 0,
            talentMultiplier: 1,
          },
        ],
        kind: "summon",
        nextHitIndex: 0,
        secondsRemaining,
      };
      const context = createKitTestContext(COMBATANT, { kitEffectState: { effects: [summon] } });

      expect(stepKitTestEffects(0.5, context)).toHaveLength(strikeCount);
      expect(context.kitEffectState.effects).toStrictEqual([]);
    },
  );
});
