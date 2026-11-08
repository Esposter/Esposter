import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { createHealEnergyPassiveModule } from "#src/services/weapon/passives/createHealEnergyPassiveModule";

// Principle of Equilibrium at its rank: when its wielder performs a heal, the heal names the wielder as its source, and the
// Wielder restores the rank's Energy, at most once every cooldown the rank gives in seconds, even off the field
export const createPrincipleOfEquilibriumPassiveModule = (params: number[]): PassiveModule =>
  createHealEnergyPassiveModule(params, {
    checkIsCounted: (event, characterId) => event.sourceCharacterId === characterId,
    cooldownId: "principleOfEquilibriumCooldown",
  });
