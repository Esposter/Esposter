import type { GcsimQueuedHit } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedHit";

import { checkIsSameDeclaration } from "#src/services/genshinAssets/kits/gcsim/checkIsSameDeclaration";

// A call firing the first hit's attack, or a copy of it where neither call repeats in a loop: a loop's repeated calls
// Are ticks of their attack, as a DoT's calls are
export const checkIsSameHit = (hit: GcsimQueuedHit, first: GcsimQueuedHit): boolean =>
  hit.attack === first.attack ||
  (checkIsSameDeclaration(hit.attack, first.attack) && hit.iterations === undefined && first.iterations === undefined);
