import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitField } from "#src/models/kit/KitField";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
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

// Odette's behaviour: while she is deployed, a Superconduct any party member triggers leaves a Polestar Field round
// The body, and a standing one is refreshed rather than doubled. A Cryo Swirl leaves a Stellar Vortex, one at a time.
// The combat's Stellar-Conduct and Stellar Swirl stand on these placed gadgets. gcsim v2.47.2 (MIT) creates them
// Inside the reaction (pkg/reactable/stellarconduct_gadget.go and stellarswirl_gadget.go), where this places them
// On the next step
// https://genshin-impact.fandom.com/wiki/Odette
export const createOdetteKitBehaviour = ({ readArea, readSeconds }: KitRecordReader): KitBehaviour => {
  const polestarArea = readArea("polestar");
  const polestarSeconds = readSeconds("polestar");
  const polestarTickSeconds = readSeconds("polestarTick");
  const stellarVortexSeconds = readSeconds("stellarVortex");
  return {
    onKitEvent: (event, { body, kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      for (const { element, reactionType } of event.reactions)
        if (reactionType === ReactionType.Superconduct) {
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
        } else if (
          reactionType === ReactionType.Swirl &&
          element === Element.Cryo &&
          !kitEffectState.effects.some(checkIsStellarVortex)
        )
          castKitSummon(kitEffectState, body, combatant, [], {
            id: STELLAR_VORTEX_ID,
            secondsRemaining: stellarVortexSeconds,
          });
    },
  };
};
