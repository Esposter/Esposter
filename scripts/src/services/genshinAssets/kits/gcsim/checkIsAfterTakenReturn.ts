import type { ReturnedConstellationGate } from "#src/models/genshinAssets/kits/gcsim/ReturnedConstellationGate";

import { ReturnedConstellationComparison } from "#src/models/genshinAssets/kits/gcsim/ReturnedConstellationComparison";

// Whether a position comes after a returning constellation block in the block it sits in, at a constellation whose test
// Holds, so the return has ended the code before it at that constellation
export const checkIsAfterTakenReturn = (
  position: number,
  gates: readonly ReturnedConstellationGate[],
  constellation: number,
): boolean =>
  gates.some(
    ({ comparison, end, scopeEnd, threshold }) =>
      end < position &&
      position < scopeEnd &&
      (comparison === ReturnedConstellationComparison.Less ? constellation < threshold : constellation >= threshold),
  );
