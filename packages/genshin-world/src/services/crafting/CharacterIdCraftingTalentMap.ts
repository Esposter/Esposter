import type { CraftingTalent } from "#src/models/crafting/CraftingTalent";

import { CraftingTalentEffect } from "#src/models/crafting/CraftingTalentEffect";
import {
  COMBINE_TYPE_CHARACTER_TALENT_MATERIAL,
  COMBINE_TYPE_ENHANCEMENT,
  COMBINE_TYPE_POTION,
  COMBINE_TYPE_WEAPON_ASCENSION,
} from "#src/services/crafting/constants";

// The crafting talent each character's utility passive gives the bench, by the character's avatar id, as the wiki's
// Crafting Talents category holds them. Each one applies to the recipes of the combine types it names, and draws its
// Effect at the chance the talent gives
export const CharacterIdCraftingTalentMap: Record<number, CraftingTalent> = {
  10_000_002: {
    chance: 0.1,
    combineTypes: [COMBINE_TYPE_WEAPON_ASCENSION],
    effect: CraftingTalentEffect.DoubleProduct,
  },
  10_000_006: { chance: 0.2, combineTypes: COMBINE_TYPE_POTION, effect: CraftingTalentEffect.Refund },
  10_000_025: {
    chance: 0.25,
    combineTypes: [COMBINE_TYPE_CHARACTER_TALENT_MATERIAL],
    effect: CraftingTalentEffect.Refund,
  },
  10_000_038: {
    chance: 0.1,
    combineTypes: [COMBINE_TYPE_WEAPON_ASCENSION],
    effect: CraftingTalentEffect.DoubleProduct,
  },
  10_000_041: { chance: 0.25, combineTypes: [COMBINE_TYPE_WEAPON_ASCENSION], effect: CraftingTalentEffect.Refund },
  10_000_043: { chance: 0.1, combineTypes: [COMBINE_TYPE_ENHANCEMENT], effect: CraftingTalentEffect.DoubleProduct },
  10_000_051: {
    chance: 0.1,
    combineTypes: [COMBINE_TYPE_CHARACTER_TALENT_MATERIAL],
    effect: CraftingTalentEffect.DoubleProduct,
  },
  10_000_058: {
    chance: 0.25,
    combineTypes: [COMBINE_TYPE_CHARACTER_TALENT_MATERIAL],
    effect: CraftingTalentEffect.RegionalTalentMaterial,
  },
  10_000_068: { chance: 0.25, combineTypes: [COMBINE_TYPE_ENHANCEMENT], effect: CraftingTalentEffect.Refund },
  10_000_074: {
    chance: 0.1,
    combineTypes: [COMBINE_TYPE_CHARACTER_TALENT_MATERIAL],
    effect: CraftingTalentEffect.DoubleProduct,
  },
  10_000_078: {
    chance: 0.1,
    combineTypes: [COMBINE_TYPE_WEAPON_ASCENSION],
    effect: CraftingTalentEffect.DoubleProduct,
  },
  10_000_086: {
    chance: 0.1,
    combineTypes: [COMBINE_TYPE_WEAPON_ASCENSION],
    effect: CraftingTalentEffect.DoubleProduct,
  },
  10_000_132: {
    chance: 0.1,
    combineTypes: [COMBINE_TYPE_CHARACTER_TALENT_MATERIAL],
    effect: CraftingTalentEffect.RegionalTalentMaterial,
  },
};
