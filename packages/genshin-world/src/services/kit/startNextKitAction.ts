import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { PartyMember } from "#src/models/party/PartyMember";
import type { Stamina } from "genshin-engine";

import {
  AIRBORNE_LOCOMOTION_STATES,
  CHARGED_ATTACK_HOLD_SECONDS,
  ON_FOOT_LOCOMOTION_STATES,
} from "#src/services/kit/constants";
import { startKitAction } from "#src/services/kit/startKitAction";
import { takeOne } from "@esposter/shared";

// The action the presses ask for once none is playing: a charged attack once a strike held past its hold has ended, a
// Burst or a skill its gates allow in any state they may start in, else the string's next strike when it is pressed or
// Queued on the ground
export const startNextKitAction = (
  kitState: KitState,
  kit: Kit,
  { isAttackPressed, isBurstPressed, isSkillPressed, locomotionState }: KitInput,
  partyMember: PartyMember,
  stamina: Stamina,
  isStrikeEnded: boolean,
  landedHits: KitHit[],
): KitAction | undefined => {
  const isOnFoot = ON_FOOT_LOCOMOTION_STATES.includes(locomotionState);
  const isSkillOrBurstState = isOnFoot || AIRBORNE_LOCOMOTION_STATES.includes(locomotionState);
  const isHeldThroughStrike = isStrikeEnded && kitState.attackHeldSeconds >= CHARGED_ATTACK_HOLD_SECONDS;
  if (isHeldThroughStrike && stamina.value >= kit.chargedAttackStamina) {
    stamina.spend(kit.chargedAttackStamina);
    return startKitAction(kitState, kit.chargedAttack, landedHits);
  }

  const isBurstReady = partyMember.burstCooldownSeconds <= 0 && partyMember.energy >= kit.burstEnergyCost;
  if (isBurstPressed && isSkillOrBurstState && isBurstReady) {
    partyMember.energy = 0;
    partyMember.burstCooldownSeconds = kit.burstCooldownSeconds;
    return startKitAction(kitState, kit.elementalBurst, landedHits);
  }

  const isSkillReady = partyMember.skillCooldownSeconds <= 0;
  if (isSkillPressed && isSkillOrBurstState && isSkillReady) {
    partyMember.skillCooldownSeconds = kit.skillCooldownSeconds;
    return startKitAction(kitState, kit.elementalSkill, landedHits);
  }

  if ((isAttackPressed || kitState.isAttackQueued) && isOnFoot) {
    const { comboIndex } = kitState;
    kitState.comboIndex = (comboIndex + 1) % kit.normalAttacks.length;
    return startKitAction(kitState, takeOne(kit.normalAttacks, comboIndex), landedHits);
  }

  return undefined;
};
