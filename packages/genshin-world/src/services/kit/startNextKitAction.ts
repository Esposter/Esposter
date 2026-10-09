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
  CHARGED_ATTACK_HOLD_SECONDS,
  ON_FOOT_LOCOMOTION_STATES,
} from "#src/services/kit/constants";
import { startKitAction } from "#src/services/kit/startKitAction";
import { takeOne } from "@esposter/shared";

// The action the presses ask for once none is playing: a charged attack once a strike held past its hold has ended, a
// Burst or a skill its gates allow in any state they may start in, else the string's next strike when it is pressed or
// Queued on the ground. A skill with holds starts on its release, at the hold level its seconds held reach
export const startNextKitAction = (
  kitState: KitState,
  kit: Kit,
  { isAttackPressed, isBurstPressed, isSkillPressed, locomotionState }: KitInput,
  partyMember: PartyMember,
  stamina: Stamina,
  isStrikeEnded: boolean,
  landedHits: KitHit[],
  context: KitStepContext,
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

  // A press inside a skill chain's window plays its follow-up whatever the cooldown, which the chain's first press set
  const isSkillReady = partyMember.skillCooldownSeconds <= 0;
  const isChaining = kitState.skillChainCount > 0;
  const isSkillTriggered = kit.elementalSkillHolds ? kitState.skillReleasedSeconds > 0 : isSkillPressed;
  if (isSkillTriggered && isSkillOrBurstState && (isChaining || isSkillReady)) {
    if (isChaining) {
      const followUps = kit.elementalSkillChain?.followUps ?? [];
      const followUp = takeOne(followUps, kitState.skillChainCount - 1);
      kitState.skillChainCount = kitState.skillChainCount < followUps.length ? kitState.skillChainCount + 1 : 0;
      kitState.skillChainSeconds = 0;
      return startKitAction(kitState, followUp, landedHits);
    }
    // The hold a release's seconds reach, if the skill has holds, and the cooldown its level or the skill sets
    const hold = kit.elementalSkillHolds?.findLast(
      ({ minimumHeldSeconds }) => kitState.skillReleasedSeconds >= minimumHeldSeconds,
    );
    const cooldownSeconds = hold?.cooldownSeconds ?? kit.skillCooldownSeconds;
    partyMember.skillCooldownSeconds = cooldownSeconds * (kit.getSkillCooldownMultiplier?.(context) ?? 1);
    kitState.skillChainCount = kit.elementalSkillChain ? 1 : 0;
    kitState.skillChainSeconds = 0;
    return startKitAction(kitState, hold?.action ?? kit.elementalSkill, landedHits);
  }

  if ((isAttackPressed || kitState.isAttackQueued) && isOnFoot) {
    const { comboIndex } = kitState;
    kitState.comboIndex = (comboIndex + 1) % kit.normalAttacks.length;
    return startKitAction(kitState, takeOne(kit.normalAttacks, comboIndex), landedHits);
  }

  return undefined;
};
