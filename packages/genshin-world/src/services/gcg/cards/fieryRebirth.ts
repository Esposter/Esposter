import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

export const FIERY_REBIRTH_ID = 123_022;
const FIERY_REBIRTH_HP = 4;
const FIERY_REBIRTH_SKILL_DAMAGE_BONUS = 1;

// Fiery Rebirth, Abyss Lector's passive state: when the character would be defeated, it is restored to 4 HP once, and its
// Counter marks the state triggered (the state stays, since the character deals 1 more DMG with its skills from then on)
export const fieryRebirth: GcgCardModule = {
  modifyDamageDealt: (context, damage, zoneCard) =>
    zoneCard.counter > 0 && context.skill !== undefined
      ? { ...damage, value: damage.value + FIERY_REBIRTH_SKILL_DAMAGE_BONUS }
      : damage,
  replaceDefeat: (_context, zoneCard) => {
    if (zoneCard.counter > 0) return undefined;
    zoneCard.counter = 1;
    return FIERY_REBIRTH_HP;
  },
};
