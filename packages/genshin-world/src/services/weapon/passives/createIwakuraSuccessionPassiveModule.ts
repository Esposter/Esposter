import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { collectDelayedKitEnergy } from "#src/services/kit/effects/collectDelayedKitEnergy";
import { delayKitEnergy } from "#src/services/kit/effects/delayKitEnergy";
import { releaseKitHolds } from "#src/services/kit/effects/releaseKitHolds";
import { takeOne } from "@esposter/shared";

const SUCCESSION_COOLDOWN_ID = "successionCooldown";
const SUCCESSION_ENERGY_ID = "successionEnergy";
const SUCCESSION_ENERGY_SECONDS = 2;
const SUCCESSION_ID = "succession";

// Iwakura Succession at its rank: an Elemental Skill its wielder uses gains a seed, once in the cooldown, and the seeds
// Last the rank's seconds, up to the rank's maximum. A burst consumes every seed and, after two seconds, gives the wielder
// The rank's energy for each seed it consumed
export const createIwakuraSuccessionPassiveModule = (params: number[]): WeaponPassiveModule => {
  const seedSeconds = takeOne(params, 0);
  const maximumSeeds = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  const energyPerSeed = takeOne(params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.SkillUsed && event.characterId === characterId) {
        if (checkIsKitStatusActive(context.kitEffectState.effects, characterId, SUCCESSION_COOLDOWN_ID)) return;
        addKitStatus(context.kitEffectState, characterId, {
          id: SUCCESSION_COOLDOWN_ID,
          secondsRemaining: cooldownSeconds,
        });
        addKitHold(context.kitEffectState, characterId, {
          id: SUCCESSION_ID,
          maximum: maximumSeeds,
          seconds: seedSeconds,
        });
      } else if (event.kind === KitEventKind.BurstUsed && event.characterId === characterId) {
        const seeds = releaseKitHolds(context.kitEffectState, characterId, SUCCESSION_ID);
        if (seeds > 0)
          delayKitEnergy(context.kitEffectState, characterId, {
            energy: seeds * energyPerSeed,
            id: SUCCESSION_ENERGY_ID,
            seconds: SUCCESSION_ENERGY_SECONDS,
          });
      }
      collectDelayedKitEnergy(event, context, combatant, SUCCESSION_ENERGY_ID);
    },
  };
};
