import type { GoNamedFunction } from "#src/models/genshinAssets/kits/gcsim/GoNamedFunction";

import { readGoEnclosingFunction } from "#src/services/genshinAssets/kits/gcsim/readGoEnclosingFunction";

// The position the body of the innermost named function around a position opens at, -1 when it is in none, so a search
// Back from the position runs to the start of the file
export const readGoEnclosingBodyStart = (namedFunctions: readonly GoNamedFunction[], position: number): number =>
  readGoEnclosingFunction(namedFunctions, position)?.bodyStart ?? -1;
