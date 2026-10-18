import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitField } from "#src/models/kit/KitField";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

export const ODETTE_CHARACTER_ID = 10_000_150;

const POLESTAR_FIELD_ID = "polestar";
const STELLAR_VORTEX_ID = "stellarVortex";

const checkIsPolestar = (effect: KitEffect): effect is KitField =>
  effect.kind === "field" && effect.id === POLESTAR_FIELD_ID;
const checkIsStellarVortex = (effect: KitEffect): effect is KitSummon =>
  effect.kind === "summon" && effect.id === STELLAR_VORTEX_ID;

// Odette's behaviour: while she is deployed, a Stellar-Conduct any party member triggers leaves a Polestar Field round
// The body, and a standing one is refreshed rather than doubled. A Stellar Swirl leaves a Stellar Vortex, one at a time.
// This places them on the next step, where gcsim v2.47.2 creates them inside the reaction
// (pkg/reactable/stellarconduct_gadget.go and stellarswirl_gadget.go)
// https://genshin-impact.fandom.com/wiki/Odette
export const createOdetteKitBehaviour = ({ readArea, readSeconds }: KitRecordReader): KitBehaviour => {
  const polestarArea = readArea("polestar");
  const polestarSeconds = readSeconds("polestar");
  const polestarTickSeconds = readSeconds("polestarTick");
  const stellarVortexSeconds = readSeconds("stellarVortex");
  return {
    onKitEvent: (event, { body, kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      for (const { reactionType } of event.reactions)
        if (reactionType === ReactionType.StellarConduct) {
          const polestar = kitEffectState.effects.find(checkIsPolestar);
          if (polestar) {
            polestar.secondsRemaining = polestarSeconds;
            continue;
          }
          // The Polestar Field deals no hit of the kit's own, so its tick has nothing to do
          castKitField(kitEffectState, combatant.characterId, body.position, {
            id: POLESTAR_FIELD_ID,
            nextTickSeconds: polestarTickSeconds,
            onTick: () => undefined,
            radius: polestarArea.radius,
            secondsRemaining: polestarSeconds,
            tickIntervalSeconds: polestarTickSeconds,
          });
        } else if (reactionType === ReactionType.StellarSwirl && !kitEffectState.effects.some(checkIsStellarVortex))
          castKitSummon(kitEffectState, body, combatant, [], {
            id: STELLAR_VORTEX_ID,
            secondsRemaining: stellarVortexSeconds,
          });
    },
  };
};
