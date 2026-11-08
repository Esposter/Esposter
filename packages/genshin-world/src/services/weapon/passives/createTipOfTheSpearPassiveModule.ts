import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { createHealEnergyPassiveModule } from "#src/services/weapon/passives/createHealEnergyPassiveModule";

// Tip of the Spear, Rightful Reward's passive at its rank: after its wielder is healed, it restores the rank's Energy to the
// Wielder, at most once every cooldown the rank gives in seconds, whether or not the wielder is on the field
export const createTipOfTheSpearPassiveModule = (params: number[]): PassiveModule =>
  createHealEnergyPassiveModule(params, {
    checkIsCounted: (event, characterId) => event.characterId === characterId,
    cooldownId: "tipOfTheSpearCooldown",
  });
