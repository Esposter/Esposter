import type { FishingBite } from "#src/models/fishing/FishingBite";

import { FishingPhase } from "#src/models/fishing/FishingPhase";

// The bite after `seconds`, and the phase the cast is in: a fish nibbles until its nibble seconds pass, then bites. A
// Strike on a biting fish reels it, and a strike on a nibbling one scares it off. A bite left unstruck past its timeout
// Lapses back to aiming
export const stepFishingBite = (
  bite: FishingBite,
  { biteTimeout, isStruck, seconds }: { biteTimeout: number; isStruck: boolean; seconds: number },
): { bite: FishingBite; phase: FishingPhase } => {
  const advanced = { ...bite, elapsedSeconds: bite.elapsedSeconds + seconds };
  const bitingSeconds = advanced.elapsedSeconds - advanced.nibbleSeconds;
  if (bitingSeconds < 0) return { bite: advanced, phase: isStruck ? FishingPhase.Aiming : FishingPhase.Waiting };
  if (bitingSeconds >= biteTimeout) return { bite: advanced, phase: FishingPhase.Aiming };
  return { bite: advanced, phase: isStruck ? FishingPhase.Reeling : FishingPhase.Biting };
};
