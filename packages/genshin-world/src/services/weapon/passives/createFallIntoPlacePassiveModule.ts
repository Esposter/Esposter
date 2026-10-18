import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";

// Fall Into Place, Master Key's passive at its rank: after its wielder causes a reaction, its Elemental Mastery rises by the
// Rank's amount, and by the rank's Moonsign amount more under Ascendant Gleam
export const createFallIntoPlacePassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionBuffPassiveModule(params, { attribute: Attribute.ElementalMastery, source: "fallIntoPlace" });
