import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { AMBER_CHARACTER_ID } from "#src/services/character/constants";
import { createAmberKit } from "#src/services/kit/characters/amberKit";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { stepKitTaunt } from "#src/services/kit/effects/stepKitTaunt";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const AMBER_KIT = createAmberKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [AMBER_CHARACTER_ID]));

const createTaunt = (health: number, secondsRemaining: number): KitTaunt => ({
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: AMBER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: AMBER_KIT,
    level: 90,
  },
  explosion: {
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 3 },
    hitmarkSeconds: 0,
    poiseDamage: 260,
    talentMultiplier: 1.232,
  },
  health,
  kind: "taunt",
  secondsRemaining,
});

describe(stepKitTaunt, () => {
  test("strikes nothing while its health and seconds last, then explodes once when either runs out", () => {
    expect.hasAssertions();
    const taunt = createTaunt(100, 5);
    expect(stepKitTaunt(taunt)).toStrictEqual([]);
    damageKitTaunt(taunt, 150);
    expect(taunt.health).toBe(0);
    expect(stepKitTaunt(taunt)).toHaveLength(1);
    expect(taunt.secondsRemaining).toBe(0);
  });
});
