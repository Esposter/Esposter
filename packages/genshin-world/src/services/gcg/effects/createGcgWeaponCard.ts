import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

// A weapon card that only a character of its weapon kind may equip, and that adds one DMG to the damage its character deals
export const createGcgWeaponCard = (weapon: string): Pick<GcgCardModule, "canPlay" | "modifyDamageDealt"> => ({
  canPlay: ({ duel, sideIndex }, targetIndex) =>
    targetIndex !== undefined && takeOne(duel.sides, sideIndex).characters.at(targetIndex)?.character.weapon === weapon,
  modifyDamageDealt: (_context, damage) => ({ ...damage, value: damage.value + 1 }),
});
