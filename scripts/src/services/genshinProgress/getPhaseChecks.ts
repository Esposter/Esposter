import type { GenshinArea } from "#src/models/genshinProgress/GenshinArea";
import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";
import type { GenshinExitReadings } from "#src/models/genshinProgress/GenshinExitReadings";

import { checkWithoutCommand } from "#src/services/genshinProgress/checkWithoutCommand";
import { GENSHIN_PHASE_GATES } from "#src/services/genshinProgress/constants";
import { getAreaChecks } from "#src/services/genshinProgress/getAreaChecks";

// A phase's checks, printed under its table: each of its compute areas' own checks, then each clause of its exit gate
export const getPhaseChecks = (
  phase: number,
  areas: readonly GenshinArea[],
  exit: GenshinExitReadings,
): GenshinExitCheck[] => [
  ...areas.filter((area) => area.phase === phase).flatMap((area) => getAreaChecks(area, exit)),
  ...GENSHIN_PHASE_GATES.filter((clause) => clause.phase === phase).map(({ gate }) => checkWithoutCommand(gate)),
];
