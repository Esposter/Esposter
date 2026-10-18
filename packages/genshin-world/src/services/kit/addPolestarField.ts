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
import { createPolestarFieldHooks } from "#src/services/kit/createPolestarFieldHooks";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";

const checkIsPolestarField = (effect: KitEffect): effect is KitField =>
  effect.kind === "field" && effect.id === POLESTAR_FIELD_ID;

// The Polestar Field a Stellar-Conduct leaves, written in place, the point given being where the body stands: the
// Standing one the body is inside is refreshed to its full seconds, and otherwise one is placed round the body beside
// Any other, cast by the character that triggered the reaction, as gcsim's queueStellarConduct resets the field the
// Player is within and places a new one where it is within none (pkg/reactable/stellarconduct.go:74). The reaction
// Exists only where a member's enabler allows it, so any enabler's Stellar-Conduct does this with no kit of its own
export const addPolestarField = (
  kitEffectState: KitEffectState,
  characterId: number,
  reactions: readonly Reaction[],
  position: GroundPoint,
): void => {
  if (!reactions.some(({ reactionType }) => reactionType === ReactionType.StellarConduct)) return;
  const polestar = kitEffectState.effects.find(
    (effect): effect is KitField => checkIsPolestarField(effect) && checkIsInKitField(effect, position),
  );
  if (polestar) {
    polestar.secondsRemaining = POLESTAR_FIELD_SECONDS;
    return;
  }
  castKitField(kitEffectState, characterId, position, {
    id: POLESTAR_FIELD_ID,
    isStacked: true,
    nextTickSeconds: POLESTAR_FIELD_TICK_SECONDS,
    // Its hooks carry the Prism's own count and the Physical RES it takes, so its tick has nothing to do
    ...createPolestarFieldHooks(),
    radius: POLESTAR_FIELD_RADIUS,
    secondsRemaining: POLESTAR_FIELD_SECONDS,
    tickIntervalSeconds: POLESTAR_FIELD_TICK_SECONDS,
  });
};
