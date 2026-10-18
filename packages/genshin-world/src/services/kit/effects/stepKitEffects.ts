import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { stepKitBubble } from "#src/services/kit/effects/stepKitBubble";
import { stepKitNightsoul } from "#src/services/kit/effects/stepKitNightsoul";
import { stepKitField } from "#src/services/kit/effects/stepKitField";
import { stepKitShield } from "#src/services/kit/effects/stepKitShield";
import { stepKitSummon } from "#src/services/kit/effects/stepKitSummon";
import { stepKitTaunt } from "#src/services/kit/effects/stepKitTaunt";
import { runDownSeconds } from "#src/services/runDownSeconds";

// The strike an effect lands as it ends, if it lands one: a taunt's, a bubble's or a shield's explosion, a shield's from
// The body on the field
const endKitEffect = (effect: KitEffect, { body }: KitContext): KitStrike | undefined => {
  if (effect.kind === "taunt") return stepKitTaunt(effect);
  if (effect.kind === "bubble") return stepKitBubble(effect);
  if (effect.kind === "shield") return stepKitShield(effect, body.position);
  return undefined;
};

// The effects on the team run on by a step, written in place in three walks: each effect's seconds run down and a
// Stance's held seconds run up, then each field's schedule runs on, then the summons land their hits and the taunts,
// Bubbles and shields that end explode. A field's tick reads the world's combat state, and an effect a tick adds starts
// At its full seconds and is stepped by the last walk. A summon its kit or a swap ended before the step lands nothing in
// It, as gcsim's ticks check that their summon still stands: Durin's Dragon recast over (durin/burst.go:111), Yae Miko's
// Totems destroyed (yaemiko/kitsune.go:55) and Klee's sparks on a swap (klee/burst.go:59, 131), at v2.47.2 (MIT). The
// Last walk also drops the effects that have run out from the list in place. The step's lists start here: the strikes
// The summons land and the explosions go into the context's strikes, and the effects that ran out into its expired
// Effects
export const stepKitEffects = (stepSeconds: number, context: KitContext): void => {
  const { body, expiredEffects, kitEffectState, strikes } = context;
  strikes.length = 0;
  expiredEffects.length = 0;
  for (const effect of kitEffectState.effects) {
    effect.secondsRemaining = runDownSeconds(effect.secondsRemaining, stepSeconds);
    if (effect.kind === "stance") effect.elapsedSeconds += stepSeconds;
  }
  for (const effect of kitEffectState.effects) if (effect.kind === "field") stepKitField(effect, stepSeconds, context);
  // A tick may have written a new list, which the last walk steps and drops from
  const { effects } = kitEffectState;
  let keptCount = 0;
  for (const effect of effects) {
    if (effect.kind !== "summon") {
      const strike = endKitEffect(effect, context);
      if (strike) strikes.push(strike);
    }
    // A summon whose seconds had run out before the step, ended by its kit or a swap, lands nothing more
    else if (effect.secondsRemaining + stepSeconds > 0) stepKitSummon(effect, stepSeconds, body.position, strikes);
    if (effect.secondsRemaining > 0) effects[keptCount++] = effect;
    else expiredEffects.push(effect);
  }
  effects.length = keptCount;
  stepKitNightsoul(stepSeconds, kitEffectState);
};
