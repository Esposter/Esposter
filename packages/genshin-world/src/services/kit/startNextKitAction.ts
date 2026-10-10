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
import { getKitFieldCooldownMultiplier } from "#src/services/kit/effects/getKitFieldCooldownMultiplier";
import { getSkillReadySeconds } from "#src/services/kit/getSkillReadySeconds";
import { startKitAction } from "#src/services/kit/startKitAction";
import { getImpetuousWindsSkillCooldownMultiplier } from "#src/services/party/getImpetuousWindsSkillCooldownMultiplier";
import { takeOne } from "@esposter/shared";

// The action the presses ask for once none is playing: a charged attack once a strike held past its hold has ended, a
// Burst or a skill its gates allow in any state they may start in, else the string's next strike when it is pressed or
// Queued on the ground. A charged attack spends its stamina at the factor the kit's passive gives it, a skill starts
// While a charge of it stands, and a skill with holds starts on its release, at the hold level its seconds held reach. A
// Skill's or a burst's cooldown is lowered by each field the body casts it inside that lowers cooldowns
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
  if (isStrikeEnded && kitState.attackHeldSeconds >= CHARGED_ATTACK_HOLD_SECONDS) {
    const chargedAttackStamina = kit.chargedAttackStamina * (kit.getChargedAttackStaminaMultiplier?.(context) ?? 1);
    if (stamina.checkCanSpend(chargedAttackStamina)) {
      // A charged attack that costs none spends nothing, so the pool's refill is not held back by it
      if (chargedAttackStamina > 0) stamina.spend(chargedAttackStamina);
      return startKitAction(kitState, kit.chargedAttack, landedHits);
    }
  }

  const isBurstReady = partyMember.burstCooldownSeconds <= 0 && partyMember.energy >= kit.burstEnergyCost;
  if (isBurstPressed && isSkillOrBurstState && isBurstReady) {
    partyMember.energy = 0;
    partyMember.burstCooldownSeconds =
      kit.burstCooldownSeconds * getKitFieldCooldownMultiplier(context.kitEffectState.effects, context.body.position);
    return startKitAction(kitState, kit.elementalBurst, landedHits);
  }

  // A press inside a skill chain's window plays its follow-up whatever the cooldown, which the chain's first press set
  const isSkillReady =
    getSkillReadySeconds(kit, context.combatant.elementalResonances, partyMember.skillCooldownSeconds) <= 0;
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
    // The hold a release's seconds reach, if the skill has holds, and the cooldown its level or the skill adds to the
    // Seconds until every charge is back
    const hold = kit.elementalSkillHolds?.findLast(
      ({ minimumHeldSeconds }) => kitState.skillReleasedSeconds >= minimumHeldSeconds,
    );
    const cooldownSeconds = hold?.cooldownSeconds ?? kit.skillCooldownSeconds;
    partyMember.skillCooldownSeconds +=
      cooldownSeconds *
      (kit.getSkillCooldownMultiplier?.(context) ?? 1) *
      getKitFieldCooldownMultiplier(context.kitEffectState.effects, context.body.position) *
      getImpetuousWindsSkillCooldownMultiplier(context.combatant.elementalResonances);
    kitState.skillChainCount = kit.elementalSkillChain ? 1 : 0;
    kitState.skillChainSeconds = 0;
    const holdAction = hold?.variant?.checkIsActive(context) ? hold.variant.action : hold?.action;
    return startKitAction(kitState, holdAction ?? kit.elementalSkill, landedHits);
  }

  if ((isAttackPressed || kitState.isAttackQueued) && isOnFoot) {
    const { comboIndex } = kitState;
    kitState.comboIndex = (comboIndex + 1) % kit.normalAttacks.length;
    return startKitAction(kitState, takeOne(kit.normalAttacks, comboIndex), landedHits);
  }

  return undefined;
};
