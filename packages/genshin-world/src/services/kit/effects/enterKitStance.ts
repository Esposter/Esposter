import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStanceActions } from "#src/models/kit/KitStanceActions";
import type { KitSwapEndable } from "#src/models/kit/KitSwapEndable";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { tagKitHits } from "#src/services/kit/tagKitHits";

// A stance entered on a combatant's character for its seconds, restarting the one it holds: its combatant is built once,
// The combatant's with the stance's actions in place of its kit's own, each of whose hits deals the kind of attack its
// Action does unless it names its own. One that ends on a swap ends as its character leaves the field, as gcsim's exit
// Handlers delete theirs. Its resource, if it holds one, starts at its starting count for the same seconds
export const enterKitStance = (
  kitEffectState: KitEffectState,
  combatant: Combatant,
  { resource, ...actions }: KitStanceActions,
  secondsRemaining: number,
  { isEndedOnSwap }: KitSwapEndable = {},
): void => {
  addKitEffect(kitEffectState, {
    characterId: combatant.characterId,
    combatant: { ...combatant, kit: tagKitHits({ ...combatant.kit, ...actions }) },
    elapsedSeconds: 0,
    ...(isEndedOnSwap && { isEndedOnSwap }),
    kind: "stance",
    secondsRemaining,
  });
  if (resource)
    addKitStatus(kitEffectState, combatant.characterId, {
      id: resource.id,
      secondsRemaining,
      stacks: resource.startingCount,
      ...(isEndedOnSwap && { isEndedOnSwap }),
    });
};
