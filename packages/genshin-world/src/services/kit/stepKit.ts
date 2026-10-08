import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { PartyMember } from "#src/models/party/PartyMember";
import type { Stamina } from "genshin-engine";

import {
  AIRBORNE_LOCOMOTION_STATES,
  HIGH_PLUNGE_MIN_HEIGHT,
  NORMAL_ATTACK_RESET_SECONDS,
  ON_FOOT_LOCOMOTION_STATES,
  PLUNGE_COLLISION_SECONDS,
} from "#src/services/kit/constants";
import { endKitAction } from "#src/services/kit/endKitAction";
import { landKitHits } from "#src/services/kit/landKitHits";
import { startKitAction } from "#src/services/kit/startKitAction";
import { startNextKitAction } from "#src/services/kit/startNextKitAction";
import { LocomotionState } from "genshin-engine";

// One fixed step of a character's kit, written in place. A plunge strikes its collision every interval it falls and
// Lands its low or high plunge by the drop. Otherwise the action playing moves on its hitmarks, ends at its seconds or
// Where the body leaves the states it allows, and once none is playing the presses start the next. It returns the
// Action this step started, which the caller aims on, and pushes the hits that land this step into landedHits
export const stepKit = (
  kitState: KitState,
  kit: Kit,
  input: KitInput,
  partyMember: PartyMember,
  stamina: Stamina,
  stepSeconds: number,
  landedHits: KitHit[],
): KitAction | undefined => {
  const { height, isAttackHeld, isAttackPressed, locomotionState } = input;
  const wasPlunging = kitState.locomotionState === LocomotionState.Plunge;
  kitState.locomotionState = locomotionState;
  kitState.attackHeldSeconds = isAttackHeld ? kitState.attackHeldSeconds + stepSeconds : 0;

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
    const isSkillOrBurst = action === kit.elementalSkill || action === kit.elementalBurst;
    const isAllowed =
      ON_FOOT_LOCOMOTION_STATES.includes(locomotionState) ||
      (isSkillOrBurst && AIRBORNE_LOCOMOTION_STATES.includes(locomotionState));
    if (isAllowed) {
      const fromSeconds = kitState.actionSeconds;
      kitState.actionSeconds += stepSeconds;
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
  return startNextKitAction(kitState, kit, input, partyMember, stamina, isStrikeEnded, landedHits);
};
