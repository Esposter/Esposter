import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { createReactionMasteryPassiveModule } from "#src/services/weapon/passives/createReactionMasteryPassiveModule";

// Fall Into Place, Master Key's passive at its rank: after its wielder causes a reaction, its Elemental Mastery rises by the
// Rank's amount, and by the rank's Moonsign amount more under Ascendant Gleam
export const createFallIntoPlacePassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionMasteryPassiveModule(params, { source: "fallIntoPlace" });
