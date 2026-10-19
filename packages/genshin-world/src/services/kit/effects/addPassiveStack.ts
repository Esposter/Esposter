import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { PassiveStack } from "#src/models/kit/PassiveStack";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";

// One stack of a passive's bonuses on its wielder: the stacks it holds counted up to its maximum, each bonus raised by its
// Per-stack amount, and every stack restarting the passive's seconds. Once the stacks reach their maximum, its maximum
// Bonuses land too, restarting with them. A passive still on its cooldown adds none. Returns whether a stack was added
export const addPassiveStack = (
  kitEffectState: KitEffectState,
  characterId: number,
  passive: PassiveStack,
): boolean => {
  const { cooldownSeconds, id, maximumBonuses = [], maximumStacks, perStackBonuses = [], seconds } = passive;
  const cooldownId = `${id}Cooldown`;
  if (cooldownSeconds !== undefined && !startKitCooldown(kitEffectState, characterId, cooldownId, cooldownSeconds))
    return false;
  const stacks = Math.min((findKitStatus(kitEffectState.effects, characterId, id)?.stacks ?? 0) + 1, maximumStacks);
  addKitStatus(kitEffectState, characterId, { id, secondsRemaining: seconds, stacks });
  for (const { amount, attribute } of perStackBonuses)
    buffKitMember(kitEffectState, characterId, {
      amount: stacks * amount,
      attribute,
      secondsRemaining: seconds,
      source: id,
    });
  if (stacks === maximumStacks)
    for (const { amount, attribute } of maximumBonuses)
      buffKitMember(kitEffectState, characterId, { amount, attribute, secondsRemaining: seconds, source: id });
  return true;
};
