import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createBondOfLifeSkillPassiveModule } from "#src/services/weapon/passives/createBondOfLifeSkillPassiveModule";

// Finale of the Deep, An End Sublime's passive at its rank: after its wielder uses its Elemental Skill, once every
// Cooldown the rank gives, its ATK rises by the rank's percentage for its seconds and it is granted a Bond of Life
// Worth the rank's share of its Max HP. When that Bond of Life is cleared, its flat ATK rises by the rank's rate of the
// HP cleared, at most the rank's maximum
export const createFinaleOfTheDeepPassiveModule = (params: number[]): PassiveModule =>
  createBondOfLifeSkillPassiveModule(params, {
    clearedAttributes: [Attribute.Attack],
    priceClearedAmount: (clearedHealth, rate, max) => Math.min(max, clearedHealth * rate),
    skillAttributes: [Attribute.AttackPercent],
    source: "finaleOfTheDeep",
  });
