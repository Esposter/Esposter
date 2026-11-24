import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { endKitStatus } from "#src/services/kit/effects/endKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const FLOWRIDER_ID = "flowrider";
const FLOWRIDER_COOLDOWN_ID = "netSnapperFlowriderCooldown";
const FLOWRIDER_HIT_COOLDOWN_ID = "netSnapperFlowriderHitCooldown";

// Net Snapper at its rank: an Elemental Skill its wielder uses gives Flowrider for the rank's seconds.
// Flowrider can be given once every cooldown the rank gives in seconds.
// An attack hit the wielder lands while it stands queues a small AoE at the rank's multiplier of ATK.
// That AoE comes at most once every hit cooldown the rank gives in seconds.
// Flowrider ends after the rank's count of those hits
export const createNetSnapperPassiveModule = (params: number[]): PassiveModule => {
  const talentMultiplier = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const maximumHits = takeOne(params, 2);
  const hitCooldownSeconds = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  return {
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { effects } = context.kitEffectState;
      if (event.kind === KitEventKind.SkillUsed) {
        if (
          event.characterId === characterId &&
          startKitCooldown(context.kitEffectState, characterId, FLOWRIDER_COOLDOWN_ID, cooldownSeconds)
        )
          addKitStatus(context.kitEffectState, characterId, {
            id: FLOWRIDER_ID,
            secondsRemaining: seconds,
            stacks: maximumHits,
          });
        return;
      }
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== characterId ||
        event.attackTag === undefined ||
        !checkIsKitStatusActive(effects, characterId, FLOWRIDER_ID) ||
        !queueCooldownHit(
          context,
          combatant,
          FLOWRIDER_HIT_COOLDOWN_ID,
          hitCooldownSeconds,
          { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier },
          event.enemy,
        )
      )
        return;
      const status = findKitStatus(effects, characterId, FLOWRIDER_ID);
      const remainingHits = (status?.stacks ?? 0) - 1;
      if (status && remainingHits > 0) status.stacks = remainingHits;
      else endKitStatus(context.kitEffectState, characterId, FLOWRIDER_ID);
    },
  };
};
