import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createSkillBuffPassiveModule } from "#src/services/weapon/passives/createSkillBuffPassiveModule";

// Pact of Flowing Springs at its rank: after its wielder uses an Elemental Skill, its DEF rises by the rank's percentage for
// The rank's seconds
export const createPactOfFlowingSpringsPassiveModule = (params: number[]): PassiveModule =>
  createSkillBuffPassiveModule(params, { attribute: Attribute.DefensePercent, source: "pactOfFlowingSprings" });
