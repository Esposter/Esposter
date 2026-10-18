import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { createReactionMasteryPassiveModule } from "#src/services/weapon/passives/createReactionMasteryPassiveModule";

// Phantom Flash, Snare Hook's passive at its rank: after its wielder causes a reaction, its Elemental Mastery rises by the
// Rank's amount, and by the rank's Moonsign amount more under Ascendant Gleam
export const createPhantomFlashPassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionMasteryPassiveModule(params, { source: "phantomFlash" });
