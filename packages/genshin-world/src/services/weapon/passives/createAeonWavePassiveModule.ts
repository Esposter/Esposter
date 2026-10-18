import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const AEON_WAVE_ID = "aeonWave";
const AEON_WAVE_ENERGY_COOLDOWN_ID = "aeonWaveEnergyCooldown";
const AEON_WAVE_MAXIMUM_STACKS = 3;

// Tome of the Eternal Flow at its rank: each change in the wielder's current HP adds a stack of the rank's Charged Attack
// DMG, up to three, once every cooldown and each stack running its seconds. A third stack, or a refresh of it, restores the
// Rank's energy to the wielder once every twelve seconds. The rank's HP line is a table line the weapon carries whatever its
// Conditions, so this passive does not repeat it
export const createAeonWavePassiveModule = (params: number[]): PassiveModule => {
  const stackSeconds = takeOne(params, 0);
  const stackCooldownSeconds = takeOne(params, 1);
  const damageBonusPerStack = takeOne(params, 2);
  const energy = takeOne(params, 3);
  const energyCooldownSeconds = takeOne(params, 4);
  return {
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (event.kind !== KitEventKind.HealthChanged || event.characterId !== combatant.characterId) return;
      const { characterId } = combatant;
      const isStackAdded = addPassiveStack(kitEffectState, characterId, {
        cooldownSeconds: stackCooldownSeconds,
        id: AEON_WAVE_ID,
        maximumStacks: AEON_WAVE_MAXIMUM_STACKS,
        perStackBonuses: [{ amount: damageBonusPerStack, attribute: Attribute.ChargedAttackDamageBonus }],
        seconds: stackSeconds,
      });
      if (
        !isStackAdded ||
        findKitStatus(kitEffectState.effects, characterId, AEON_WAVE_ID)?.stacks !== AEON_WAVE_MAXIMUM_STACKS ||
        !startKitCooldown(kitEffectState, characterId, AEON_WAVE_ENERGY_COOLDOWN_ID, energyCooldownSeconds)
      )
        return;
      gainPartyMemberEnergy(party, combatant, energy);
    },
  };
};
