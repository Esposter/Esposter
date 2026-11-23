import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { FLOAT_RESIDUE } from "#src/services/floatResidue";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { takeOne } from "@esposter/shared";

const OPPIDAN_AMBUSH_SOURCE = "oppidanAmbush";
const OPPIDAN_AMBUSH_HOLD_ID = "oppidanAmbushHold";
const OPPIDAN_AMBUSH_DECAY_ID = "oppidanAmbushDecay";
// The rise's most seconds, which the text's 20% at the rank's rate gives
const MAXIMUM_RISE_SECONDS = 10;
// The fall is twice the rise a second, as the text's 4% gives the rank's 2%
const FALL_RATE_SCALE = 2;

const checkIsOppidanBuff = (effect: KitEffect, characterId: number): effect is KitBuff =>
  effect.kind === "buff" && effect.characterId === characterId && effect.source === OPPIDAN_AMBUSH_SOURCE;

const findOppidanBuff = (effects: readonly KitEffect[], characterId: number): KitBuff | undefined =>
  effects.find((effect): effect is KitBuff => checkIsOppidanBuff(effect, characterId));

const checkIsOppidanStatus = (effect: KitEffect, characterId: number): boolean =>
  effect.kind === "status" &&
  effect.characterId === characterId &&
  (effect.id === OPPIDAN_AMBUSH_HOLD_ID || effect.id === OPPIDAN_AMBUSH_DECAY_ID);

// The buff's amount is set as the rise or the fall moves it, and a buff of the same attribute and source restarts in
// Place
const setOppidanBuff = (kitEffectState: KitEffectState, characterId: number, amount: number): void => {
  buffKitMember(kitEffectState, characterId, {
    amount,
    attribute: Attribute.AllDamageBonus,
    secondsRemaining: Number.POSITIVE_INFINITY,
    source: OPPIDAN_AMBUSH_SOURCE,
  });
};

// Oppidan Ambush at its rank: off the field, its wielder's DMG rises by the rank's rate a second, to ten seconds'
// Worth. On the Field, the DMG holds for the rank's seconds and then falls at twice the rate a second until none.
// Leaving the field ends the Hold and the fall, and the rise resumes from the DMG it has
export const createOppidanAmbushPassiveModule = (params: number[]): PassiveModule => {
  const ratePerSecond = takeOne(params, 0);
  const holdSeconds = takeOne(params, 1);
  const maximumAmount = ratePerSecond * MAXIMUM_RISE_SECONDS;
  return {
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.characterId === characterId &&
        event.effect.id === OPPIDAN_AMBUSH_HOLD_ID
      )
        addKitStatus(kitEffectState, characterId, {
          id: OPPIDAN_AMBUSH_DECAY_ID,
          secondsRemaining: Number.POSITIVE_INFINITY,
        });
    },
    onStep: ({ activeCombatant, kitEffectState }, { characterId }, stepSeconds) => {
      const amount = findOppidanBuff(kitEffectState.effects, characterId)?.amount ?? 0;
      if (activeCombatant.characterId !== characterId) {
        removeKitEffects(kitEffectState, (effect) => checkIsOppidanStatus(effect, characterId));
        setOppidanBuff(kitEffectState, characterId, Math.min(maximumAmount, amount + ratePerSecond * stepSeconds));
        return;
      }
      if (amount === 0) return;
      if (
        !checkIsKitStatusActive(kitEffectState.effects, characterId, OPPIDAN_AMBUSH_DECAY_ID) &&
        !checkIsKitStatusActive(kitEffectState.effects, characterId, OPPIDAN_AMBUSH_HOLD_ID)
      )
        addKitStatus(kitEffectState, characterId, { id: OPPIDAN_AMBUSH_HOLD_ID, secondsRemaining: holdSeconds });
      if (!checkIsKitStatusActive(kitEffectState.effects, characterId, OPPIDAN_AMBUSH_DECAY_ID)) return;
      const fallen = amount - FALL_RATE_SCALE * ratePerSecond * stepSeconds;
      if (fallen > FLOAT_RESIDUE) {
        setOppidanBuff(kitEffectState, characterId, fallen);
        return;
      }
      removeKitEffects(
        kitEffectState,
        (effect) => checkIsOppidanStatus(effect, characterId) || checkIsOppidanBuff(effect, characterId),
      );
    },
  };
};
