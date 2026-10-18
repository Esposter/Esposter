import type { Reaction } from "#src/models/combat/Reaction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { GroundPoint } from "genshin-engine";

import { ReactionType } from "#src/models/combat/ReactionType";
import {
  POLESTAR_FIELD_ID,
  POLESTAR_FIELD_RADIUS,
  POLESTAR_FIELD_SECONDS,
  POLESTAR_FIELD_TICK_SECONDS,
} from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";

const checkIsPolestarField = (effect: KitEffect): effect is KitField =>
  effect.kind === "field" && effect.id === POLESTAR_FIELD_ID;

// The Polestar Field a Stellar-Conduct leaves, written in place: a standing one is refreshed to its full seconds, and
// Otherwise one is placed round the point given, cast by the character that triggered the reaction. The reaction exists
// Only where a party member's enabler allows it, so any enabler's Stellar-Conduct does this with no kit of its own. The
// Field deals no hit of its own, so its tick has nothing to do (gcsim v2.47.2 pkg/reactable/stellarconduct_gadget.go)
export const addPolestarField = (
  kitEffectState: KitEffectState,
  characterId: number,
  reactions: readonly Reaction[],
  position: GroundPoint,
): void => {
  if (!reactions.some(({ reactionType }) => reactionType === ReactionType.StellarConduct)) return;
  const polestar = kitEffectState.effects.find(checkIsPolestarField);
  if (polestar) {
    polestar.secondsRemaining = POLESTAR_FIELD_SECONDS;
    return;
  }
  castKitField(kitEffectState, characterId, position, {
    id: POLESTAR_FIELD_ID,
    nextTickSeconds: POLESTAR_FIELD_TICK_SECONDS,
    onTick: () => undefined,
    radius: POLESTAR_FIELD_RADIUS,
    secondsRemaining: POLESTAR_FIELD_SECONDS,
    tickIntervalSeconds: POLESTAR_FIELD_TICK_SECONDS,
  });
};
