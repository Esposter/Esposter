import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { checkIsNewerArrival } from "#src/services/shared/overlay/checkIsNewerArrival";

// An answer is judged against each copy of its message on its own, so a copy already at its version does not hold back
// A copy behind it. An update that names no version, such as a poll's optimistic apply, is not gated
export const checkIsNewerThanCopy = (
  copy: undefined | Versioned,
  { version }: { version?: number | undefined },
): boolean => version === undefined || checkIsNewerArrival<Versioned>(copy, { version });
