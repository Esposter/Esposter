import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createReactionBuffPassiveModule } from "#src/services/weapon/passives/createReactionBuffPassiveModule";

// Phantom Flash, Snare Hook's passive at its rank: after its wielder causes a reaction, its Elemental Mastery rises by the
// Rank's amount, and by the rank's Moonsign amount more under Ascendant Gleam
export const createPhantomFlashPassiveModule = (params: number[]): WeaponPassiveModule =>
  createReactionBuffPassiveModule(params, { attribute: Attribute.ElementalMastery, source: "phantomFlash" });
