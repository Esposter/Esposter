import type { Attribute } from "#src/models/character/Attribute";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

export interface PassiveStack {
  // The seconds a passive waits after it adds a stack before it adds another, if it waits at all
  cooldownSeconds?: number;
  id: string;
  maximumStacks: number;
  perStackBonuses: { amount: number; attribute: Attribute }[];
  seconds: number;
}

// One stack of a passive's bonuses on its wielder: the stacks it holds counted up to its maximum, each bonus raised by its
// Per-stack amount, and every stack restarting the passive's seconds. A passive still on its cooldown adds none
export const addPassiveStack = (kitEffectState: KitEffectState, characterId: number, passive: PassiveStack): void => {
  const { cooldownSeconds, id, maximumStacks, perStackBonuses, seconds } = passive;
  const cooldownId = `${id}Cooldown`;
  if (checkIsKitStatusActive(kitEffectState.effects, characterId, cooldownId)) return;
  if (cooldownSeconds !== undefined)
    addKitStatus(kitEffectState, characterId, { id: cooldownId, secondsRemaining: cooldownSeconds });
  const stacks = Math.min((findKitStatus(kitEffectState.effects, characterId, id)?.stacks ?? 0) + 1, maximumStacks);
  addKitStatus(kitEffectState, characterId, { id, secondsRemaining: seconds, stacks });
  for (const { amount, attribute } of perStackBonuses)
    buffKitMember(kitEffectState, characterId, {
      amount: stacks * amount,
      attribute,
      secondsRemaining: seconds,
      source: id,
    });
};
