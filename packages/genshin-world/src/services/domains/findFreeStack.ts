import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { getDomainDisorderSource } from "#src/services/domains/getDomainDisorderSource";

// The first stack of a disorder no buff of the team holds, or none where all of its stacks are given
export const findFreeStack = (
  kitEffectState: KitEffectState,
  disorder: string,
  maxStacks: number,
): number | undefined => {
  for (let stack = 0; stack < maxStacks; stack++) {
    const source = getDomainDisorderSource(disorder, stack);
    if (!kitEffectState.effects.some((effect) => effect.kind === "buff" && effect.source === source)) return stack;
  }
  return undefined;
};
