import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitBody } from "#src/services/kit/createKitBody";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// A strike the combatant deals as the given kind of attack, from the origin, its hit the Traveler's plunge collision
export const createWeaponStrike = (combatant: Combatant, attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: createKitBody({ x: 0, z: 0 }),
  combatant,
  hit: TRAVELER_KIT.plungeCollision,
});

describe.todo("createWeaponStrike");
