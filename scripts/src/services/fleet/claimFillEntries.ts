import type { FillKind } from "#src/models/fleet/FillKind";

import { takeOne } from "@esposter/shared";

// Claims up to `shortfall` entries, asking each kind in turn: a kind that answers with nothing is dropped from the turn,
// And the loop ends at the shortfall or once every kind has answered with nothing. `claimNext` claims one entry of a kind
export const claimFillEntries = async <T>(
  shortfall: number,
  kinds: readonly FillKind[],
  claimNext: (kind: FillKind) => Promise<T | undefined>,
): Promise<T[]> => {
  const claims: T[] = [];
  let pendingKinds = [...kinds];
  let index = 0;
  while (claims.length < shortfall && pendingKinds.length > 0) {
    index %= pendingKinds.length;
    // oxlint-disable-next-line no-await-in-loop -- each claim is asked for only after the one before it has won or been refused
    const claim = await claimNext(takeOne(pendingKinds, index));
    if (claim === undefined) pendingKinds = pendingKinds.toSpliced(index, 1);
    else {
      claims.push(claim);
      index += 1;
    }
  }
  return claims;
};
