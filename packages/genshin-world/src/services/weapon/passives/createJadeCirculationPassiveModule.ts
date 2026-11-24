import type { KitEffect } from "#src/models/kit/KitEffect";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { takeOne } from "@esposter/shared";

const JADE_AWAY_ID = "jadeCirculationAway";
const JADE_ON_FIELD_ID = "jadeCirculationOnField";
const JADE_SOURCE = "jadeCirculation";

const checkIsJadeStatus = (effect: KitEffect, characterId: number, id: string): boolean =>
  effect.kind === "status" && effect.characterId === characterId && effect.id === id;

const checkHasJadeBuffs = (effects: readonly KitEffect[], characterId: number): boolean =>
  effects.some(
    (effect) => effect.kind === "buff" && effect.characterId === characterId && effect.source === JADE_SOURCE,
  );

// Jade Circulation at its rank: off the field for more than the rank's away seconds, its wielder's Max HP and Elemental
// Mastery rise by the rank's two amounts, and they stand until she has been on the field for the rank's
// On-field seconds. Each count restarts when she leaves or returns to the field, so the buffs come up only after a full
// Run of seconds away
export const createJadeCirculationPassiveModule = (params: number[]): PassiveModule => {
  const onFieldSeconds = takeOne(params, 0);
  const awaySeconds = takeOne(params, 1);
  const maxHealthShare = takeOne(params, 2);
  const elementalMastery = takeOne(params, 3);
  return {
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.EffectExpired) return;
      if (checkIsJadeStatus(event.effect, characterId, JADE_AWAY_ID)) {
        buffKitMember(kitEffectState, characterId, {
          amount: maxHealthShare,
          attribute: Attribute.HealthPercent,
          secondsRemaining: Number.POSITIVE_INFINITY,
          source: JADE_SOURCE,
        });
        buffKitMember(kitEffectState, characterId, {
          amount: elementalMastery,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: Number.POSITIVE_INFINITY,
          source: JADE_SOURCE,
        });
      } else if (checkIsJadeStatus(event.effect, characterId, JADE_ON_FIELD_ID))
        removeKitEffects(
          kitEffectState,
          (effect) => effect.kind === "buff" && effect.characterId === characterId && effect.source === JADE_SOURCE,
        );
    },
    onStep: ({ activeCombatant, kitEffectState }, { characterId }) => {
      if (activeCombatant.characterId !== characterId) {
        removeKitEffects(kitEffectState, (effect) => checkIsJadeStatus(effect, characterId, JADE_ON_FIELD_ID));
        if (
          !checkHasJadeBuffs(kitEffectState.effects, characterId) &&
          !checkIsKitStatusActive(kitEffectState.effects, characterId, JADE_AWAY_ID)
        )
          addKitStatus(kitEffectState, characterId, { id: JADE_AWAY_ID, secondsRemaining: awaySeconds });
        return;
      }
      removeKitEffects(kitEffectState, (effect) => checkIsJadeStatus(effect, characterId, JADE_AWAY_ID));
      if (
        checkHasJadeBuffs(kitEffectState.effects, characterId) &&
        !checkIsKitStatusActive(kitEffectState.effects, characterId, JADE_ON_FIELD_ID)
      )
        addKitStatus(kitEffectState, characterId, { id: JADE_ON_FIELD_ID, secondsRemaining: onFieldSeconds });
    },
  };
};
