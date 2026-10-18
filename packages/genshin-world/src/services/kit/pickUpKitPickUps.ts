import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitPickUp } from "#src/models/kit/KitPickUp";
import type { GroundPoint } from "genshin-engine";

import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";

// Whether a body standing where it stands picks up an effect: a pick-up that has not run out, may be picked up, and lies
// Within its radius of the body
const checkIsPickedUp = (effect: KitEffect, body: GroundPoint): effect is KitPickUp =>
  effect.kind === "pickUp" &&
  effect.secondsRemaining > 0 &&
  effect.secondsRemaining <= effect.pickableSeconds &&
  Math.hypot(effect.position.x - body.x, effect.position.z - body.z) <= effect.radius;

// The pick-ups the body of the character on the field stands within reach of, picked up once each may be: each is taken
// Off the team's effects, so it never runs out and its kit hears no EffectExpired for it, then does what picking it up
// Does, in the order the team's effects hold them
export const pickUpKitPickUps = (context: KitContext, body: GroundPoint): void => {
  const { kitEffectState } = context;
  if (!kitEffectState.effects.some((effect) => checkIsPickedUp(effect, body))) return;
  const pickUps = kitEffectState.effects.filter((effect) => checkIsPickedUp(effect, body));
  removeKitEffects(kitEffectState, (effect) => checkIsPickedUp(effect, body));
  for (const pickUp of pickUps) pickUp.onPickedUp(context, pickUp);
};
