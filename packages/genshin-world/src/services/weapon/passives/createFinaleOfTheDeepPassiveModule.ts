import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createBondOfLifeSkillPassiveModule } from "#src/services/weapon/passives/createBondOfLifeSkillPassiveModule";

// Finale of the Deep, An End Sublime's passive at its rank: after its wielder uses its Elemental Skill, once every cooldown the
// Rank gives, its ATK rises by the rank's percentage for its seconds and it is granted a Bond of Life worth the rank's share of
// Its Max HP. When that Bond of Life is cleared, its flat ATK rises by the rank's rate of the HP cleared, at most the rank's maximum
export const createFinaleOfTheDeepPassiveModule = (params: number[]): WeaponPassiveModule =>
  createBondOfLifeSkillPassiveModule(params, {
    clearedAttributes: [Attribute.Attack],
    priceClearedAmount: (clearedHealth, rate, max) => Math.min(max, clearedHealth * rate),
    skillAttributes: [Attribute.AttackPercent],
    source: "finaleOfTheDeep",
  });
