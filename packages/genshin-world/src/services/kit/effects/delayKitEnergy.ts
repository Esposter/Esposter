import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";

// Delays a flat amount of energy a character gains until its seconds run out, held as a status under the id. A second delay
// Under the id while the first is still due adds its energy to the first and waits out its seconds too
export const delayKitEnergy = (
  kitEffectState: KitEffectState,
  characterId: number,
  { energy, id, seconds }: { energy: number; id: string; seconds: number },
): void => {
  const pendingEnergy = checkIsKitStatusActive(kitEffectState.effects, characterId, id)
    ? (findKitStatus(kitEffectState.effects, characterId, id)?.stacks ?? 0)
    : 0;
  addKitStatus(kitEffectState, characterId, { id, secondsRemaining: seconds, stacks: pendingEnergy + energy });
};
