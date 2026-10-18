import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";

import { checkIsKitHitIncomplete } from "#src/services/kit/build/checkIsKitHitIncomplete";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A built hit given what its behaviour runs and completes, in place. It fails where the behaviour completes what the hit
// Holds none of, prices a hit its record already scales, or leaves a party heal, a bubble or a stacked hit incomplete
export const applyKitHitBehaviour = (hit: KitHit, behaviour: KitHitBehaviour, path: string): KitHit => {
  const {
    additiveBaseDamageBonus,
    bubbleOmenId,
    enemyStatus,
    healAttackShare,
    healPartyChance,
    onStrike,
    stackedHitStatusId,
    takesWielderElement,
  } = behaviour;
  const fail = (reason: string) => new InvalidOperationError(Operation.Update, path, reason);
  if (additiveBaseDamageBonus) {
    if (hit.additiveBaseDamageBonus) throw fail("its record already scales its damage with a stat");
    hit.additiveBaseDamageBonus = additiveBaseDamageBonus;
  }
  if (takesWielderElement) {
    if (!hit.element) throw fail("its record names no element for it to take from its wielder");
    delete hit.element;
  }
  if (enemyStatus) hit.enemyStatus = enemyStatus;
  if (healAttackShare) hit.healAttackShare = healAttackShare;
  if (onStrike) hit.onStrike = onStrike;
  if (bubbleOmenId !== undefined) {
    if (!hit.bubble) throw fail("its record holds no bubble");
    hit.bubble.omen.id = bubbleOmenId;
  }
  if (healPartyChance) {
    if (!hit.healParty) throw fail("its record holds no party heal");
    hit.healParty.chance = healPartyChance;
  }
  if (stackedHitStatusId !== undefined) {
    if (!hit.stackedHit) throw fail("its record holds no stacked hit");
    hit.stackedHit.statusId = stackedHitStatusId;
  }
  if (checkIsKitHitIncomplete(hit))
    throw fail("its behaviour leaves its bubble's omen, its party heal's chance or its stacked hit's status missing");
  return hit;
};
