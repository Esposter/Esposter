import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

export const ODETTE_CHARACTER_ID = 10_000_150;

const STELLAR_VORTEX_ID = "stellarVortex";

const checkIsStellarVortex = (effect: KitEffect): effect is KitSummon =>
  effect.kind === "summon" && effect.id === STELLAR_VORTEX_ID;

// Odette's behaviour: a Stellar Swirl leaves a Stellar Vortex, one at a time. Her Polestar Field on a Stellar-Conduct is
// Not kept here: the reaction path places it for any enabler's Stellar-Conduct (`addPolestarField`). This places the
// Vortex on the next step, where gcsim v2.47.2 creates it inside the reaction (pkg/reactable/stellarswirl_gadget.go)
// https://genshin-impact.fandom.com/wiki/Odette
export const createOdetteKitBehaviour = ({ readSeconds }: KitRecordReader): KitBehaviour => {
  const stellarVortexSeconds = readSeconds("stellarVortex");
  return {
    onKitEvent: (event, { body, kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      for (const { reactionType } of event.reactions)
        if (reactionType === ReactionType.StellarSwirl && !kitEffectState.effects.some(checkIsStellarVortex))
          castKitSummon(kitEffectState, body, combatant, [], {
            id: STELLAR_VORTEX_ID,
            secondsRemaining: stellarVortexSeconds,
          });
    },
  };
};
