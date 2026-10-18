import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createHealBuffPassiveModule } from "#src/services/weapon/passives/createHealBuffPassiveModule";

// Benthic Pulse, Song of Stillness's passive at its rank: after its wielder is healed, its DMG rises by the rank's percentage
// For the rank's seconds
export const createBenthicPulsePassiveModule = (params: number[]): WeaponPassiveModule =>
  createHealBuffPassiveModule(params, { attribute: Attribute.AllDamageBonus, source: "benthicPulse" });
