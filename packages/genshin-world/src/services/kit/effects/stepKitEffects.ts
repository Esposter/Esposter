import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { stepKitBubble } from "#src/services/kit/effects/stepKitBubble";
import { stepKitField } from "#src/services/kit/effects/stepKitField";
import { stepKitShield } from "#src/services/kit/effects/stepKitShield";
import { stepKitSummon } from "#src/services/kit/effects/stepKitSummon";
import { stepKitTaunt } from "#src/services/kit/effects/stepKitTaunt";

// The effects on the team run on by a step, written in place: each effect's seconds run down, a stance's held seconds
// Run up, each field's schedule runs on, and those that have run out are dropped from the list into the expired effects
// Given. A field's tick reads the character on the field and its body, and an effect a tick adds starts at its full
// Seconds. It returns the hits the summons land, and the explosions of the taunts, bubbles and shields that end this
// Step, a shield's from the body on the field
export const stepKitEffects = (
  kitEffectState: KitEffectState,
  stepSeconds: number,
  context: { activeCombatant: Combatant; body: GroundPoint; party: Party },
  expiredEffects: KitEffect[] = [],
): KitStrike[] => {
  const { activeCombatant, body, party } = context;
  for (const effect of kitEffectState.effects) {
    effect.secondsRemaining -= stepSeconds;
    if (effect.kind === "stance") effect.elapsedSeconds += stepSeconds;
  }
  for (const effect of kitEffectState.effects)
    if (effect.kind === "field") stepKitField(effect, stepSeconds, body, { activeCombatant, kitEffectState, party });
  const strikes = kitEffectState.effects.flatMap((effect) => {
    if (effect.kind === "summon") return stepKitSummon(effect, stepSeconds, body);
    if (effect.kind === "taunt") return stepKitTaunt(effect);
    if (effect.kind === "bubble") return stepKitBubble(effect);
    if (effect.kind === "shield") return stepKitShield(effect, body);
    return [];
  });
  expiredEffects.push(...kitEffectState.effects.filter(({ secondsRemaining }) => secondsRemaining <= 0));
  kitEffectState.effects = kitEffectState.effects.filter(({ secondsRemaining }) => secondsRemaining > 0);
  return strikes;
};
