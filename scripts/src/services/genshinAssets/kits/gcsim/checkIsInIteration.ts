import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";

// Whether an attack is one a call in the loop iterations given fires: a variant of a copy's attack is only in the one
// Iteration its `if` names, and every other attack is in all of them
export const checkIsInIteration = (attack: GcsimAttack, iterations: GcsimQueuedAttack["iterations"]): boolean =>
  attack.iteration === undefined || iterations?.[attack.iteration.variable] === attack.iteration.value;
