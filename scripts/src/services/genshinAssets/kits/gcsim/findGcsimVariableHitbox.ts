import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimQueuedHit } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedHit";

// The hitbox of the one queue call firing a talent variable, where the variable is the hit's. Calls firing one variable
// Are one hit's alternatives, which a branch reader picks between, so none of them is read
export const findGcsimVariableHitbox = (
  queuedHits: readonly GcsimQueuedHit[],
  talentVariable: string | undefined,
): GcsimHitbox | undefined => {
  if (talentVariable === undefined) return undefined;
  const firingCalls = queuedHits.filter(({ attack }) => attack.talentVariable === talentVariable);
  return firingCalls.length === 1 ? firingCalls[0]?.hitbox : undefined;
};
