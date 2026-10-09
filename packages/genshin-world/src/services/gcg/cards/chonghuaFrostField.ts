import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { takeOne } from "@esposter/shared";

// The weapon kinds Chonghua Frost Field converts the Physical DMG of: Sword, Claymore and Polearm
const CHONGHUA_FROST_FIELD_WEAPONS = new Set<string>(["SWORD", "CLAYMORE", "POLE"]);

// Chonghua Frost Field: for two rounds, the Physical DMG dealt by a Sword, Claymore or Polearm character of its side is
// Converted to Cryo DMG (the wiki's Chonghua's Layered Frost (Character Card Skill))
export const chonghuaFrostField: GcgCardModule = {
  initialRounds: 2,
  modifyDamageDealt: ({ duel, sideIndex }, damage) => {
    const character = takeOne(duel.sides, sideIndex).characters.at(takeOne(duel.sides, sideIndex).activeIndex);
    return damage.damageType === GcgDamageKind.Physical &&
      character !== undefined &&
      CHONGHUA_FROST_FIELD_WEAPONS.has(character.character.weapon)
      ? { ...damage, damageType: Element.Cryo }
      : damage;
  },
};
