import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createBondOfLifeSkillPassiveModule } from "#src/services/weapon/passives/createBondOfLifeSkillPassiveModule";

// Flowing Purity, Unfinished Masterpiece's passive at its rank: after its wielder uses its Elemental Skill, once every cooldown
// The rank gives, its All Elemental DMG Bonus rises by the rank's percentage for its seconds and it is granted a Bond of Life
// Worth the rank's share of its Max HP. When that Bond of Life is cleared, its All Elemental DMG Bonus rises by the rank's rate
// For every 1,000 HP cleared, at most the rank's maximum, for its seconds
export const createFlowingPurityPassiveModule = (params: number[]): WeaponPassiveModule =>
  createBondOfLifeSkillPassiveModule(params, {
    clearedAttributes: ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES,
    priceClearedAmount: (clearedHealth, rate, max) => Math.min(max, Math.floor(clearedHealth / 1000) * rate),
    skillAttributes: ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES,
    source: "flowingPurity",
  });
