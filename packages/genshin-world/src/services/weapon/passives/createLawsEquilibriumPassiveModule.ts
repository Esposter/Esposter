import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createSkillBuffPassiveModule } from "#src/services/weapon/passives/createSkillBuffPassiveModule";

// The Law's Equilibrium at its rank: for the rank's seconds after its wielder uses an Elemental Skill, its Elemental Mastery
// Rises by the rank's amount
export const createLawsEquilibriumPassiveModule = (params: number[]): WeaponPassiveModule =>
  createSkillBuffPassiveModule(params, { attribute: Attribute.ElementalMastery, source: "lawsEquilibrium" });
