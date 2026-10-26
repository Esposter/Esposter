import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitState } from "#src/models/kit/KitState";
import type { PartyMember } from "#src/models/party/PartyMember";
import type { Stamina } from "genshin-engine";

import { checkCanStartKitAction } from "#src/services/kit/checkCanStartKitAction";
import {
  AIRBORNE_LOCOMOTION_STATES,
  CHARGED_ATTACK_HOLD_SECONDS,
  ON_FOOT_LOCOMOTION_STATES,
} from "#src/services/kit/constants";
import { checkIsKitSkillChargeComplete } from "#src/services/kit/effects/checkIsKitSkillChargeComplete";
import { clearKitSkillCharge } from "#src/services/kit/effects/clearKitSkillCharge";
import { getKitInfusionCooldownMultiplier } from "#src/services/kit/effects/getKitInfusionCooldownMultiplier";
import { spendKitChargeSkip } from "#src/services/kit/effects/spendKitChargeSkip";
import { getSkillReadySeconds } from "#src/services/kit/getSkillReadySeconds";
import { startKitAction } from "#src/services/kit/startKitAction";
import { getImpetuousWindsSkillCooldownMultiplier } from "#src/services/party/getImpetuousWindsSkillCooldownMultiplier";
import { takeOne } from "@esposter/shared";

// The action the presses ask for once none is playing: a charged attack once a strike held past its hold has ended, a
// Burst or a skill its gates allow in any state they may start in, else the string's next strike when it is pressed or
// Queued on the ground. A charged attack spends its stamina at the factor the kit's passive gives it, a skill starts
// While a charge of it stands, and a skill with holds starts on its release, at the hold level its seconds held reach,
// Or the top one while a counter window stands. A skill's or a burst's cooldown is lowered by each infusion the
// Active character holds that lowers cooldowns. An action whose
// Start gate fails starts nothing, and what it would have spent or advanced stays as it was
export const startNextKitAction = (
  kitState: KitState,
  kit: Kit,
  { isAttackPressed, isBurstPressed, isSkillPressed, locomotionState }: KitInput,
  partyMember: PartyMember,
  stamina: Stamina,
  isStrikeEnded: boolean,
  landedHits: KitHit[],
  context: KitContext,
): KitAction | undefined => {
  const isOnFoot = ON_FOOT_LOCOMOTION_STATES.includes(locomotionState);
  const isSkillOrBurstState = isOnFoot || AIRBORNE_LOCOMOTION_STATES.includes(locomotionState);
  if (isStrikeEnded && kitState.attackHeldSeconds >= CHARGED_ATTACK_HOLD_SECONDS) {
    const chargedAttackStamina = kit.chargedAttackStamina * (kit.getChargedAttackStaminaMultiplier?.(context) ?? 1);
    const chargedAttackAction = kit.chargedAttackVariant?.checkIsActive(context)
      ? kit.chargedAttackVariant.action
      : kit.chargedAttack;
    // A charged attack still needs some stamina in the pool when its cost is cut to none, as the wiki's note on Bloodstained
    // Chivalry says, so an empty pool starts none
    if (
      checkCanStartKitAction(chargedAttackAction, context) &&
      stamina.value > 0 &&
      stamina.checkCanSpend(chargedAttackStamina)
    ) {
      // A charged attack that costs none spends nothing, so the pool's refill is not held back by it
      if (chargedAttackStamina > 0) stamina.spend(chargedAttackStamina);
      // A charge skip the kit holds starts the shot past its charge, and is spent by it
      const { chargeSeconds } = chargedAttackAction;
      const startSeconds =
        chargeSeconds !== undefined && spendKitChargeSkip(context.kitEffectState, context.activeCombatant.characterId)
          ? chargeSeconds
          : 0;
      return startKitAction(kitState, chargedAttackAction, landedHits, context, { startSeconds });
    }
  }

  const isBurstReady = partyMember.burstCooldownSeconds <= 0 && partyMember.energy >= kit.burstEnergyCost;
  if (isBurstPressed && isSkillOrBurstState && isBurstReady) {
    const burstAction = kit.elementalBurstVariant?.checkIsActive(context)
      ? kit.elementalBurstVariant.action
      : kit.elementalBurst;
    if (checkCanStartKitAction(burstAction, context)) {
      partyMember.energy = 0;
      partyMember.burstCooldownSeconds =
        kit.burstCooldownSeconds *
        getKitInfusionCooldownMultiplier(context.kitEffectState.effects, context.activeCombatant.characterId);
      return startKitAction(kitState, burstAction, landedHits, context);
    }
  }

  // A press inside a skill chain's window plays its follow-up whatever the cooldown, which the chain's first press set
  // A skill whose cooldown the kit's effects waive starts whatever it is, as a constellation's status lets Xianyun do
  const isSkillReady =
    kit.checkIsSkillCooldownWaived?.(context) === true ||
    getSkillReadySeconds(kit, context.activeCombatant, partyMember.skillCooldownSeconds) <= 0;
  const isChaining = kitState.skillChainCount > 0;
  const isSkillTriggered = kit.elementalSkillHolds ? kitState.skillReleasedSeconds > 0 : isSkillPressed;
  // A press that ends the state the skill holds starts it with none of its hits, off any cooldown, and ends a chain
  if (isSkillTriggered && isSkillOrBurstState && kit.elementalSkill.checkIsStateEndingPress?.(context)) {
    kitState.skillChainCount = 0;
    kitState.skillChainSeconds = 0;
    return startKitAction(kitState, kit.elementalSkill, landedHits, context, { isHitless: true });
  }
  if (isSkillTriggered && isSkillOrBurstState && (isChaining || isSkillReady)) {
    if (isChaining) {
      const followUps = kit.elementalSkillChain?.followUps ?? [];
      const followUp = takeOne(followUps, kitState.skillChainCount - 1);
      if (!checkCanStartKitAction(followUp, context)) return undefined;
      kitState.skillChainCount = kitState.skillChainCount < followUps.length ? kitState.skillChainCount + 1 : 0;
      kitState.skillChainSeconds = 0;
      return startKitAction(kitState, followUp, landedHits, context);
    }
    // The hold a release's seconds reach, if the skill has holds, and the cooldown its level or the skill adds to the
    // Seconds until every charge is back
    const { activeCombatant, kitEffectState } = context;
    const isChargeComplete = checkIsKitSkillChargeComplete(kitEffectState, activeCombatant.characterId);
    // A counter window standing on the character releases at the top level, as a completed charge does
    const isTopLevel = kit.jumpsSkillHoldToTop?.(context) === true;
    const hold = kit.elementalSkillHolds?.findLast(
      ({ minimumHeldSeconds }) => isChargeComplete || isTopLevel || kitState.skillReleasedSeconds >= minimumHeldSeconds,
    );
    const holdAction = hold?.variant?.checkIsActive(context) ? hold.variant.action : hold?.action;
    const skillAction = holdAction ?? kit.elementalSkill;
    if (checkCanStartKitAction(skillAction, context)) {
      clearKitSkillCharge(kitEffectState, activeCombatant.characterId);
      const cooldownSeconds = hold?.cooldownSeconds ?? kit.skillCooldownSeconds;
      partyMember.skillCooldownSeconds +=
        cooldownSeconds *
        (kit.getSkillCooldownMultiplier?.(context) ?? 1) *
        getKitInfusionCooldownMultiplier(context.kitEffectState.effects, context.activeCombatant.characterId) *
        getImpetuousWindsSkillCooldownMultiplier(context.activeCombatant.elementalResonances);
      kitState.skillChainCount = kit.elementalSkillChain ? 1 : 0;
      kitState.skillChainSeconds = 0;
      return startKitAction(kitState, skillAction, landedHits, context);
    }
  }

  if ((isAttackPressed || kitState.isAttackQueued) && isOnFoot) {
    const { comboIndex } = kitState;
    const normalAttack = takeOne(kit.normalAttacks, comboIndex);
    if (!checkCanStartKitAction(normalAttack, context)) return undefined;
    kitState.comboIndex = (comboIndex + 1) % kit.normalAttacks.length;
    return startKitAction(kitState, normalAttack, landedHits, context);
  }

  return undefined;
};
