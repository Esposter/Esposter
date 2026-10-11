import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { AMBER_CHARACTER_ID, createAmberKit } from "#src/services/kit/characters/amberKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe } from "vitest";

const AMBER_KIT = createAmberKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [AMBER_CHARACTER_ID]));

// Amber's Baron Bunny at the origin, with its health and seconds and the explosion it carries
export const createKitTaunt = (health: number, secondsRemaining: number): KitTaunt => ({
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

describe.todo("createKitTaunt");
