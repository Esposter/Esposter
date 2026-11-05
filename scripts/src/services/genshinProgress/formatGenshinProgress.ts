import type { GenshinProgress } from "#src/models/genshinProgress/GenshinProgress";

import { formatFleetTable } from "#src/services/fleet/formatFleetTable";
import { GENSHIN_BLOCKER_WIDTH, GENSHIN_PHASE_HEADER } from "#src/services/genshinProgress/constants";

// The report as lines: each phase's heading over its table by kind, a phase with no units saying so, and any unit that
// Holds no phase counted at the foot
export const formatGenshinProgress = ({ phases, unphased }: GenshinProgress): string[] => {
  const lines = phases.flatMap(({ name, phase, rows }) => [
    "",
    `phase ${phase}: ${name}`,
    ...(rows.length === 0
      ? ["no units"]
      : formatFleetTable(
          GENSHIN_PHASE_HEADER,
          rows.map(({ blocked, done, firstBlocker, kind, runnable, units, waiting }) => [
            kind,
            `${units}`,
            `${done}`,
            `${runnable}`,
            `${waiting}`,
            `${blocked}`,
            firstBlocker.length > GENSHIN_BLOCKER_WIDTH
              ? `${firstBlocker.slice(0, GENSHIN_BLOCKER_WIDTH - 3)}...`
              : firstBlocker,
          ]),
        )),
  ]);
  return unphased > 0 ? [...lines, "", `${unphased} units hold no phase`] : lines;
};
