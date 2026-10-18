import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { STELLAR_VORTEX_MAX_STACKS } from "#src/services/kit/constants";
import { detonateStellarVortex } from "#src/services/kit/detonateStellarVortex";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";

export const ODETTE_CHARACTER_ID = 10_000_150;

const STELLAR_VORTEX_ID = "stellarVortex";

const checkIsStellarVortex = (effect: KitEffect): effect is KitSummon =>
  effect.kind === "summon" && effect.id === STELLAR_VORTEX_ID;

// Odette's behaviour: a Stellar Swirl leaves a Stellar Vortex, one at a time. Her Polestar Field on a Stellar-Conduct is
// Not kept here: the reaction path places it for any enabler's Stellar-Conduct (`addPolestarField`). This places the
// Vortex on the next step, where gcsim v2.47.2 creates it inside the reaction (pkg/reactable/stellarswirl_gadget.go)
// Each further Stellar Swirl adds a stack, and the sixth explodes it at once, while one that runs out explodes as it stands
// https://genshin-impact.fandom.com/wiki/Odette
export const createOdetteKitBehaviour = ({ readSeconds }: KitRecordReader): KitBehaviour => {
  const stellarVortexSeconds = readSeconds("stellarVortex");
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.EffectExpired) {
        if (checkIsStellarVortex(event.effect)) detonateStellarVortex(event.effect, context);
        return;
      }
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      const { body, kitEffectState } = context;
      for (const { reactionType } of event.reactions) {
        if (reactionType !== ReactionType.StellarSwirl) continue;
        const vortex = kitEffectState.effects.find(checkIsStellarVortex);
        if (!vortex) {
          castKitSummon(kitEffectState, body, combatant, [], {
            id: STELLAR_VORTEX_ID,
            secondsRemaining: stellarVortexSeconds,
            stacks: 1,
          });
          continue;
        }
        // A further Stellar Swirl adds a stack without renewing the vortex's lifetime, as gcsim leaves it
        vortex.stacks = (vortex.stacks ?? 0) + 1;
        if (vortex.stacks < STELLAR_VORTEX_MAX_STACKS) continue;
        removeKitEffects(kitEffectState, (effect) => effect === vortex);
        detonateStellarVortex(vortex, context);
      }
    },
  };
};
