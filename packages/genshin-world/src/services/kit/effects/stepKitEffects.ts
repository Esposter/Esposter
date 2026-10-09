import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";
import type { GroundPoint } from "genshin-engine";

import { stepKitField } from "#src/services/kit/effects/stepKitField";

// The effects on the team run on by a step, written in place: each effect's seconds run down, each field's schedule
// Runs on, and those that have run out are dropped from the list. A field's tick reads the character on the field and its
// Body, and an effect a tick adds starts at its full seconds
export const stepKitEffects = (
  effects: KitEffect[],
  stepSeconds: number,
  context: { activeCombatant: Combatant; body: GroundPoint; party: Party },
): void => {
  const { activeCombatant, body, party } = context;
  for (const effect of effects) effect.secondsRemaining -= stepSeconds;
  for (const effect of effects)
    if (effect.kind === "field") stepKitField(effect, stepSeconds, body, { activeCombatant, effects, party });
  const remainingEffects = effects.filter(({ secondsRemaining }) => secondsRemaining > 0);
  effects.splice(0, effects.length, ...remainingEffects);
};
