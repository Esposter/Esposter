import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { PartyMember } from "#src/models/party/PartyMember";
import type { Stamina } from "genshin-engine";

import {
  AIRBORNE_LOCOMOTION_STATES,
  HIGH_PLUNGE_MIN_HEIGHT,
  NORMAL_ATTACK_RESET_SECONDS,
  ON_FOOT_LOCOMOTION_STATES,
  PLUNGE_COLLISION_SECONDS,
} from "#src/services/kit/constants";
import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { endKitAction } from "#src/services/kit/endKitAction";
import { landKitHits } from "#src/services/kit/landKitHits";
import { startKitAction } from "#src/services/kit/startKitAction";
import { startNextKitAction } from "#src/services/kit/startNextKitAction";
import { LocomotionState } from "genshin-engine";

// One fixed step of a character's kit, written in place. A plunge strikes its collision every interval it falls and
// Lands its low or high plunge by the drop. Otherwise the action playing moves on its hitmarks, a normal attack faster by
// The Normal ATK SPD its character's infusion raises, ends at its seconds or where the body leaves the states it allows,
// And once none is playing the presses start the next. It returns the action this step started, which the caller aims
// On, and pushes the hits that land this step into landedHits
export const stepKit = (
  kitState: KitState,
  kit: Kit,
  input: KitInput,
  partyMember: PartyMember,
  stamina: Stamina,
  stepSeconds: number,
  landedHits: KitHit[],
  context: KitStepContext,
): KitAction | undefined => {
  const { height, isAttackHeld, isAttackPressed, isSkillHeld, locomotionState } = input;
  const wasPlunging = kitState.locomotionState === LocomotionState.Plunge;
  kitState.locomotionState = locomotionState;
  kitState.attackHeldSeconds = isAttackHeld ? kitState.attackHeldSeconds + stepSeconds : 0;
  // A skill held to its maximum is released there, once: holding on past it neither starts it again nor releases it twice
  const previousHeldSeconds = kitState.skillHeldSeconds;
  const maximumHeldSeconds = kit.elementalSkillMaximumHeldSeconds ?? Infinity;
  if (isSkillHeld) {
    kitState.skillHeldSeconds = Math.min(previousHeldSeconds + stepSeconds, maximumHeldSeconds);
    kitState.skillReleasedSeconds =
      previousHeldSeconds < maximumHeldSeconds && kitState.skillHeldSeconds === maximumHeldSeconds
        ? maximumHeldSeconds
        : 0;
  } else {
    kitState.skillReleasedSeconds = previousHeldSeconds < maximumHeldSeconds ? previousHeldSeconds : 0;
    kitState.skillHeldSeconds = 0;
  }
  kitState.sprintSeconds = locomotionState === LocomotionState.Sprint ? kitState.sprintSeconds + stepSeconds : 0;
  if (kitState.sprintSeconds > 0) kit.onSprint?.(context, kitState);
  kitState.skillChainSeconds += stepSeconds;
  if (kit.elementalSkillChain && kitState.skillChainSeconds >= kit.elementalSkillChain.windowSeconds)
    kitState.skillChainCount = 0;

  if (locomotionState === LocomotionState.Plunge) {
    if (!wasPlunging) {
      endKitAction(kitState, kit);
      kitState.isAttackQueued = false;
      kitState.plungeStartHeight = height;
    }
    kitState.actionSeconds += stepSeconds;
    while (kitState.actionSeconds >= PLUNGE_COLLISION_SECONDS) {
      kitState.actionSeconds -= PLUNGE_COLLISION_SECONDS;
      landedHits.push(kit.plungeCollision);
    }
    return undefined;
  }

  if (wasPlunging && ON_FOOT_LOCOMOTION_STATES.includes(locomotionState)) {
    const drop = kitState.plungeStartHeight - height;
    return startKitAction(kitState, drop > HIGH_PLUNGE_MIN_HEIGHT ? kit.highPlunge : kit.lowPlunge, landedHits);
  }

  let isStrikeEnded = false;
  const { action } = kitState;
  if (action) {
    const isSkillOrBurst =
      action === kit.elementalSkill ||
      action === kit.elementalBurst ||
      kit.elementalSkillChain?.followUps.includes(action) === true ||
      kit.elementalSkillHolds?.some((hold) => hold.action === action || hold.variant?.action === action) === true;
    const isAllowed =
      ON_FOOT_LOCOMOTION_STATES.includes(locomotionState) ||
      (isSkillOrBurst && AIRBORNE_LOCOMOTION_STATES.includes(locomotionState));
    if (isAllowed) {
      const fromSeconds = kitState.actionSeconds;
      const speedBonus = kit.normalAttacks.includes(action)
        ? (getKitInfusion(context.kitEffectState.effects, context.combatant.characterId)?.normalAttackSpeedBonus ?? 0)
        : 0;
      kitState.actionSeconds += stepSeconds * (1 + speedBonus);
      if (action.staminaPerSecond !== undefined) stamina.spend(action.staminaPerSecond * stepSeconds);
      landKitHits(action, fromSeconds, kitState.actionSeconds, landedHits);
      if (kitState.actionSeconds < action.seconds) {
        if (isAttackPressed && !isSkillOrBurst) kitState.isAttackQueued = true;
        return undefined;
      }
      isStrikeEnded = kit.normalAttacks.includes(action);
    } else kitState.isAttackQueued = false;
    endKitAction(kitState, kit);
  }

  kitState.comboSeconds += stepSeconds;
  if (kitState.comboSeconds >= NORMAL_ATTACK_RESET_SECONDS) kitState.comboIndex = 0;
  return startNextKitAction(kitState, kit, input, partyMember, stamina, isStrikeEnded, landedHits, context);
};
