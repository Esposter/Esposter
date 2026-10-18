import type { MonumentPlace } from "#src/models/puzzle/MonumentPlace";
import type { MonumentPuzzle } from "#src/models/puzzle/MonumentPuzzle";

import { createElementalState } from "#src/services/combat/aura/createElementalState";

// A puzzle of one monument, the mark's own: its monument unlit and its puzzle unsolved
export const createMonumentPuzzle = ({ element, isTimed }: MonumentPlace): MonumentPuzzle => ({
  isSolved: false,
  monuments: [{ element, elementalState: createElementalState(), isLit: false, isTimed, litSeconds: 0 }],
});
