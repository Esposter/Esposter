import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const SKY_RIPPING_DRAGON_SPINE_ID = "skyRippingDragonSpine";

// Skyward Pride's Sky-ripping Dragon Spine at its rank: its All DMG Bonus is a static line the rank carries. A burst its
// Wielder uses starts the rank's seconds and the rank's count of vacuum blades, and each Normal or Charged Attack hit the
// Wielder lands while both last queues a blade at the rank's multiplier of ATK, using one blade. The blade's area is
// Provisional, as the game's area is not in the dump, so it is the small AoE
export const createSkyRippingDragonSpinePassiveModule = (params: number[]): WeaponPassiveModule => {
  const talentMultiplier = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const maximumBlades = takeOne(params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.BurstUsed && event.characterId === characterId) {
        addKitStatus(context.kitEffectState, characterId, {
          id: SKY_RIPPING_DRAGON_SPINE_ID,
          secondsRemaining: seconds,
          stacks: maximumBlades,
        });
        return;
      }
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== characterId ||
        !checkIsNormalOrChargedAttack(event.attackTag)
      )
        return;
      const { effects } = context.kitEffectState;
      const blades = findKitStatus(effects, characterId, SKY_RIPPING_DRAGON_SPINE_ID);
      if (!blades?.stacks || !checkIsKitStatusActive(effects, characterId, SKY_RIPPING_DRAGON_SPINE_ID)) return;
      addKitStatus(context.kitEffectState, characterId, {
        id: SKY_RIPPING_DRAGON_SPINE_ID,
        secondsRemaining: blades.secondsRemaining,
        stacks: blades.stacks - 1,
      });
      queueKitPassiveHit(context, combatant, {
        hitArea: SMALL_AOE_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
