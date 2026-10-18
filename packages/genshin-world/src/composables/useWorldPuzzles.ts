import type { Seelie } from "#src/models/puzzle/Seelie";
import type { GroundPoint } from "genshin-engine";

import { SeelieState } from "#src/models/puzzle/SeelieState";
import { checkIsSeelieFollowed } from "#src/services/puzzle/checkIsSeelieFollowed";
import { stepSeelie } from "#src/services/puzzle/stepSeelie";
import { computed, reactive } from "vue";

// The world's puzzles, the Seelies held reactive so the sight's trails and the Seelies' states read as they change. A
// Seelie the save names as settled starts settled at its court, and each one steps on the fixed step, led while the
// Character stands within reach of it
export const useWorldPuzzles = (seelies: Seelie[], savedSettledSeelieIds: ReadonlySet<string>) => {
  const puzzleSeelies = reactive(
    seelies.map((seelie) =>
      savedSettledSeelieIds.has(seelie.id) ? { ...seelie, progress: 1, state: SeelieState.Settled } : seelie,
    ),
  );
  const settledSeelieIds = computed<ReadonlySet<string>>(
    () => new Set(puzzleSeelies.filter(({ state }) => state === SeelieState.Settled).map(({ id }) => id)),
  );
  const stepWorldPuzzles = (deltaSeconds: number, position: GroundPoint): void => {
    for (const seelie of puzzleSeelies) stepSeelie(seelie, deltaSeconds, checkIsSeelieFollowed(seelie, position));
  };
  return { puzzleSeelies, settledSeelieIds, stepWorldPuzzles };
};
