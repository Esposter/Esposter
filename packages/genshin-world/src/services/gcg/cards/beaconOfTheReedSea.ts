import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";
import { takeOne } from "@esposter/shared";
import { BEACON_DAMAGE_TRIGGER_ID, BEACON_SKILL_TRIGGER_ID } from "#src/services/gcg/cards/constants";

const BEACON_DAMAGE = 1;
// The two effects the card names, each once per Round, keyed by the id of the skill that gives each

// Beacon of the Reed Sea, a Claymore: its character deals +1 DMG. After she uses an Elemental Skill, or takes DMG, the next DMG
// She deals is +1 more, each trigger once per Round. The pending bonus is the card's counter
const beaconWeapon = createGcgWeaponCard("CLAYMORE");
export const beaconOfTheReedSea: GcgCardModule = {
  ...beaconWeapon,
  modifyDamageDealt: (context, damage, zoneCard) => {
    const weaponDamage = beaconWeapon.modifyDamageDealt?.(context, damage, zoneCard) ?? damage;
    if (zoneCard.counter <= 0) return weaponDamage;
    zoneCard.counter -= 1;
    return { ...weaponDamage, value: weaponDamage.value + BEACON_DAMAGE };
  },
  onDamageTaken: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedCardIds.includes(BEACON_DAMAGE_TRIGGER_ID)) return;
    side.usedCardIds.push(BEACON_DAMAGE_TRIGGER_ID);
    zoneCard.counter += 1;
  },
  onSkillUsed: ({ duel, sideIndex }, skill, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (skill.kind !== GcgSkillKind.ElementalSkill || side.usedCardIds.includes(BEACON_SKILL_TRIGGER_ID)) return;
    side.usedCardIds.push(BEACON_SKILL_TRIGGER_ID);
    zoneCard.counter += 1;
  },
};
