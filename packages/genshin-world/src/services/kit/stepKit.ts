import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { PartyMember } from "#src/models/party/PartyMember";
import type { Stamina } from "genshin-engine";

import {
  AIRBORNE_LOCOMOTION_STATES,
  HIGH_PLUNGE_MIN_HEIGHT,
  MOVEMENT_LOCOMOTION_STATES,
  NORMAL_ATTACK_RESET_SECONDS,
  ON_FOOT_LOCOMOTION_STATES,
  PLUNGE_COLLISION_SECONDS,
} from "#src/services/kit/constants";
import { Attribute } from "#src/models/character/Attribute";
import { checkCanStartKitAction } from "#src/services/kit/checkCanStartKitAction";
import { checkLandsKitHit } from "#src/services/kit/checkLandsKitHit";
import { clearKitSkillCharge } from "#src/services/kit/effects/clearKitSkillCharge";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { endKitAction } from "#src/services/kit/endKitAction";
import { landKitHits } from "#src/services/kit/landKitHits";
import { queueKitHits } from "#src/services/kit/queueKitHits";
import { startKitAction } from "#src/services/kit/startKitAction";
import { startNextKitAction } from "#src/services/kit/startNextKitAction";
import { LocomotionState } from "genshin-engine";

// The kit's action for the dash or the jump the body enters on this step, if it enters one
const getEnteredMovementAction = (
  kit: Kit,
  previousState: LocomotionState,
  state: LocomotionState,
): KitAction | undefined => {
  if (state === previousState) return undefined;
  if (state === LocomotionState.Dash) return kit.dash;
  if (state === LocomotionState.Jump) return kit.jump;
  return undefined;
};

// Whether a queued dash or jump may start in the state the body is in as its action ends: on foot, or in a state
// A movement continues in, which a glide is not
const checkIsQueuedMovementStartState = (state: LocomotionState): boolean =>
  ON_FOOT_LOCOMOTION_STATES.includes(state) || MOVEMENT_LOCOMOTION_STATES.includes(state);

// One fixed step of a character's kit, written in place. A plunge strikes its collision every interval it falls and
// Lands its low or high plunge by the drop. Otherwise the action playing moves on its hitmarks, a normal attack faster
// By the Normal ATK SPD its character's infusion raises, and ends where the body leaves the states it allows or at its
// Seconds, which queues the hits whose hitmarks fall past them, and once none is playing a queued dash or jump starts
// If the body can, else the presses start the next. It returns the action this step started, which the caller aims on,
// And pushes the hits that land this step into landedHits
export const stepKit = (
  kitState: KitState,
  kit: Kit,
  input: KitInput,
  partyMember: PartyMember,
  stamina: Stamina,
  stepSeconds: number,
  landedHits: KitHit[],
  context: KitContext,
): KitAction | undefined => {
  const { height, isAttackHeld, isAttackPressed, isSkillHeld, locomotionState } = input;
  const wasPlunging = kitState.locomotionState === LocomotionState.Plunge;
  const previousLocomotionState = kitState.locomotionState;
  const enteredMovementAction = getEnteredMovementAction(kit, previousLocomotionState, locomotionState);
  kitState.locomotionState = locomotionState;
  kitState.attackHeldSeconds = isAttackHeld ? kitState.attackHeldSeconds + stepSeconds : 0;
  // A skill held to its maximum is released there, once: holding on past it neither starts it again nor releases it twice
  const previousHeldSeconds = kitState.skillHeldSeconds;
  const maximumHeldSeconds = kit.elementalSkillMaximumHeldSeconds ?? Infinity;
  if (isSkillHeld) {
    // A hold that starts uncharged, whatever a kit completed before it
    if (previousHeldSeconds === 0) clearKitSkillCharge(context.kitEffectState, context.activeCombatant.characterId);
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
      endKitAction(kitState, kit, { keepsCombo: false });
      kitState.isAttackQueued = false;
      kitState.queuedMovementAction = undefined;
      kitState.plungeStartHeight = height;
    }
    kitState.actionSeconds += stepSeconds;
    while (kitState.actionSeconds >= PLUNGE_COLLISION_SECONDS) {
      kitState.actionSeconds -= PLUNGE_COLLISION_SECONDS;
      if (checkLandsKitHit(kit.plungeCollision, context)) landedHits.push(kit.plungeCollision);
    }
    return undefined;
  }

  if (wasPlunging && ON_FOOT_LOCOMOTION_STATES.includes(locomotionState)) {
    const drop = kitState.plungeStartHeight - height;
    // The first plunge variant whose check holds on the landing plays in place of the standard plunge
    const plungeVariant = kit.plungeVariants?.find((variant) => variant.checkIsActive(context));
    const standardPlunge = drop > HIGH_PLUNGE_MIN_HEIGHT ? kit.highPlunge : kit.lowPlunge;
    const plunge = plungeVariant?.action ?? standardPlunge;
    if (checkCanStartKitAction(plunge, context)) return startKitAction(kitState, plunge, landedHits, context);
  }

  let isStrikeEnded = false;
  const { action } = kitState;
  if (action) {
    const isSkillOrBurst =
      action === kit.elementalSkill ||
      action === kit.elementalBurst ||
      action === kit.elementalBurstVariant?.action ||
      kit.elementalSkillChain?.followUps.includes(action) === true ||
      kit.elementalSkillHolds?.some((hold) => hold.action === action || hold.variant?.action === action) === true;
    const isMovement = action === kit.dash || action === kit.jump;
    const isAllowed =
      ON_FOOT_LOCOMOTION_STATES.includes(locomotionState) ||
      (isSkillOrBurst && AIRBORNE_LOCOMOTION_STATES.includes(locomotionState)) ||
      (isMovement && MOVEMENT_LOCOMOTION_STATES.includes(locomotionState));
    if (isAllowed) {
      const speedBonus = kit.normalAttacks.includes(action)
        ? (getKitInfusion(context.kitEffectState.effects, context.activeCombatant.characterId)
            ?.normalAttackSpeedBonus ?? 0) +
          (kit.getNormalAttackSpeedBonus?.(context) ?? 0) +
          getBuffedCombatant(
            context.activeCombatant,
            context.kitEffectState.effects,
            context.party,
            context.characterIdCombatantMap,
          ).attributes.attributeTotalMap[Attribute.NormalAttackSpeed]
        : 0;
      const elapsedSeconds = kitState.actionSeconds;
      kitState.actionSeconds += stepSeconds * (1 + speedBonus);
      const { decideLength } = action;
      if (decideLength && elapsedSeconds < decideLength.atSeconds && kitState.actionSeconds >= decideLength.atSeconds)
        kitState.actionLengthSeconds = decideLength.decide(context);
      if (action.staminaPerSecond !== undefined) stamina.spend(action.staminaPerSecond * stepSeconds);
      const landedCount = landedHits.length;
      kitState.nextHitIndex = landKitHits(
        action.hits,
        kitState.nextHitIndex,
        kitState.actionSeconds,
        landedHits,
        context,
      );
      // A hook may add one hit after each hit of a normal attack that lands, as a passive's or a constellation's follow-up
      const chainIndex = kit.normalAttacks.indexOf(action);
      if (kit.getNormalAttackExtraHit && chainIndex !== -1)
        for (const hit of landedHits.slice(landedCount)) {
          const extraHit = kit.getNormalAttackExtraHit(context, hit, chainIndex);
          if (extraHit) landedHits.push(extraHit);
        }
      if (kitState.actionSeconds < kitState.actionLengthSeconds) {
        if (isAttackPressed && !isSkillOrBurst) kitState.isAttackQueued = true;
        // Cancel frames are not built, so a dash or jump entered during the action waits for the action's end
        if (enteredMovementAction) kitState.queuedMovementAction = enteredMovementAction;
        return undefined;
      }
      queueKitHits(action, kitState, context);
      isStrikeEnded = kit.normalAttacks.includes(action);
    } else kitState.isAttackQueued = false;
    endKitAction(kitState, kit, { keepsCombo: kit.keepsNormalAttackCombo?.(context, action) === true });
  }

  kitState.comboSeconds += stepSeconds;
  if (kitState.comboSeconds >= NORMAL_ATTACK_RESET_SECONDS) kitState.comboIndex = 0;
  const { queuedMovementAction } = kitState;
  kitState.queuedMovementAction = undefined;
  const movementAction =
    enteredMovementAction ?? (checkIsQueuedMovementStartState(locomotionState) ? queuedMovementAction : undefined);
  if (movementAction && checkCanStartKitAction(movementAction, context))
    return startKitAction(kitState, movementAction, landedHits, context);
  return startNextKitAction(kitState, kit, input, partyMember, stamina, isStrikeEnded, landedHits, context);
};
