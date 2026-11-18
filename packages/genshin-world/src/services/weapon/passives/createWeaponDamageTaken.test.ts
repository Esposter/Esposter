import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// A hit the striker lands on the enemy as the given kind of attack, the enemy taking damage and not defeated by it
export const createWeaponDamageTaken = (
  striker: Combatant,
  attackTag: AttackTag,
  enemy: Enemy,
): KitDamageTakenEvent => ({
  attackTag,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker,
});

describe.todo("createWeaponDamageTaken");
