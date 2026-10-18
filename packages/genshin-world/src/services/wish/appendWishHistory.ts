import type { WishDrawSave } from "#src/models/wish/WishDrawSave";

import { MAX_WISH_HISTORY_COUNT } from "#src/services/save/constants";
import { WISH_HISTORY_WINDOW } from "#src/services/wish/constants";

const instantOf = ({ time }: WishDrawSave) => Temporal.Instant.from(time);

// The wish history once a set's draws are made: the draws appended to it, those drawn before the window's start dropped,
// And the most recent of the rest kept up to the bound, in the order they were drawn
export const appendWishHistory = (
  history: readonly WishDrawSave[],
  draws: readonly WishDrawSave[],
  now: Temporal.Instant,
): WishDrawSave[] => {
  const windowStart = now.subtract(WISH_HISTORY_WINDOW);
  return [...history, ...draws]
    .filter((draw) => Temporal.Instant.compare(instantOf(draw), windowStart) >= 0)
    .toSorted((a, b) => Temporal.Instant.compare(instantOf(a), instantOf(b)))
    .slice(-MAX_WISH_HISTORY_COUNT);
};
