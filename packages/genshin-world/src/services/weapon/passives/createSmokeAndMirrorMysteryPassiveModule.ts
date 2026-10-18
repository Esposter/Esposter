import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createSkillBuffPassiveModule } from "#src/services/weapon/passives/createSkillBuffPassiveModule";

// Smoke-and-Mirror Mystery at its rank: after its wielder uses an Elemental Skill, its DEF rises by the rank's percentage
// For the rank's seconds
export const createSmokeAndMirrorMysteryPassiveModule = (params: number[]): WeaponPassiveModule =>
  createSkillBuffPassiveModule(params, { attribute: Attribute.DefensePercent, source: "smokeAndMirrorMystery" });
