import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createHealBuffPassiveModule } from "#src/services/weapon/passives/createHealBuffPassiveModule";

// Tidal Shadow's White Cruising Wave at its rank: after its wielder is healed, its ATK rises by the rank's percentage for the
// Rank's seconds
export const createTidalShadowPassiveModule = (params: number[]): WeaponPassiveModule =>
  createHealBuffPassiveModule(params, { attribute: Attribute.AttackPercent, source: "tidalShadow" });
