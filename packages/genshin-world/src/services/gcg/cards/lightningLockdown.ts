import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { chainsOfWardingThunder } from "#src/services/gcg/cards/chainsOfWardingThunder";
import { CHAINS_OF_WARDING_THUNDER_ID } from "#src/services/gcg/cards/constants";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";

const LIGHTNING_LOCKDOWN_DAMAGE = 2;

// Lightning Lockdown, Electro Hypostasis' elemental burst: 2 Electro DMG, and Chains of Warding Thunder is summoned (the wiki's
// Lightning Lockdown)
export const lightningLockdown: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(CHAINS_OF_WARDING_THUNDER_ID, chainsOfWardingThunder),
  getDamage: () => ({ damageType: Element.Electro, value: LIGHTNING_LOCKDOWN_DAMAGE }),
};
