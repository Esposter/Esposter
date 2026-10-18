import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Extends a character's status of an id that has not run out by the seconds given, as far as the seconds it may run
// Past its start allow, and returns whether it was extended. A status started again starts its extension again
export const extendKitStatus = (
  kitEffectState: KitEffectState,
  characterId: number,
  id: string,
  { maximumSeconds, seconds }: { maximumSeconds: number; seconds: number },
): boolean => {
  const status = findKitStatus(kitEffectState.effects, characterId, id);
  if (!status || status.secondsRemaining <= 0) return false;
  const extendedSeconds = status.extendedSeconds ?? 0;
  const extension = Math.min(seconds, maximumSeconds - extendedSeconds);
  if (extension <= 0) return false;
  status.secondsRemaining += extension;
  status.extendedSeconds = extendedSeconds + extension;
  return true;
};
