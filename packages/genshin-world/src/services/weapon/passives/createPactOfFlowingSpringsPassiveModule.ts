import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createSkillBuffPassiveModule } from "#src/services/weapon/passives/createSkillBuffPassiveModule";

// Pact of Flowing Springs at its rank: after its wielder uses an Elemental Skill, its DEF rises by the rank's percentage for
// The rank's seconds
export const createPactOfFlowingSpringsPassiveModule = (params: number[]): WeaponPassiveModule =>
  createSkillBuffPassiveModule(params, { attribute: Attribute.DefensePercent, source: "pactOfFlowingSprings" });
