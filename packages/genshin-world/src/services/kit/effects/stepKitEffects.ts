import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { stepKitBubble } from "#src/services/kit/effects/stepKitBubble";
import { stepKitField } from "#src/services/kit/effects/stepKitField";
import { stepKitShield } from "#src/services/kit/effects/stepKitShield";
import { stepKitSummon } from "#src/services/kit/effects/stepKitSummon";
import { stepKitTaunt } from "#src/services/kit/effects/stepKitTaunt";

// The effects on the team run on by a step, written in place: each effect's seconds run down, a stance's held seconds
// Run up, each field's schedule runs on, and those that have run out are dropped from the list into the expired effects
// Given. A field's tick reads the world's combat state, and an effect a tick adds starts at its full seconds. It returns
// The hits the summons land, and the explosions of the taunts, bubbles and shields that end this step, a shield's from
// The body on the field
export const stepKitEffects = (
  stepSeconds: number,
  context: KitContext,
  expiredEffects: KitEffect[] = [],
): KitStrike[] => {
  const { body, kitEffectState } = context;
  for (const effect of kitEffectState.effects) {
    effect.secondsRemaining -= stepSeconds;
    if (effect.kind === "stance") effect.elapsedSeconds += stepSeconds;
  }
  for (const effect of kitEffectState.effects) if (effect.kind === "field") stepKitField(effect, stepSeconds, context);
  const strikes = kitEffectState.effects.flatMap((effect) => {
    if (effect.kind === "summon") return stepKitSummon(effect, stepSeconds, body.position);
    if (effect.kind === "taunt") return stepKitTaunt(effect);
    if (effect.kind === "bubble") return stepKitBubble(effect);
    if (effect.kind === "shield") return stepKitShield(effect, body.position);
    return [];
  });
  expiredEffects.push(...kitEffectState.effects.filter(({ secondsRemaining }) => secondsRemaining <= 0));
  kitEffectState.effects = kitEffectState.effects.filter(({ secondsRemaining }) => secondsRemaining > 0);
  return strikes;
};
