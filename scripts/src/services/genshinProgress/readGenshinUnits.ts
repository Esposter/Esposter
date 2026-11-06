import type { GenshinArea } from "#src/models/genshinProgress/GenshinArea";
import type { GenshinUnits } from "#src/models/genshinProgress/GenshinUnits";

import { readComputeAreas } from "#src/services/fleet/readComputeAreas";
import { readComputeFiles } from "#src/services/fleet/readComputeFiles";
import { GENSHIN_ROADMAP_FILE } from "#src/services/genshinProgress/constants";
import { getCompareIds } from "#src/services/genshinProgress/getCompareIds";
import { parseRoadmapItems } from "#src/services/genshinProgress/parseRoadmapItems";
import { readGenshinChanges } from "#src/services/genshinProgress/readGenshinChanges";
import { readGenshinExitReadings } from "#src/services/genshinProgress/readGenshinExitReadings";
import { readScriptedQuestIds } from "#src/services/genshinProgress/readScriptedQuestIds";
import { readProposalFiles } from "#src/services/proposals/readProposalFiles";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every unit the report counts and every reading its exit checks take, each source read once off the working tree: the
// Compute pages, the changes, the roadmap, the quests the session scripts name, the parity scores and the game data lock
export const readGenshinUnits = async (): Promise<GenshinUnits> => {
  const areas = readComputeAreas(readComputeFiles()).map(
    ({ folder, kind, phase, queue, skipped, waiting }): GenshinArea => ({
      blockers: waiting.map(({ waiting: blocker }) => blocker),
      folder,
      kind,
      needs: queue.map(({ needs }) => needs),
      parityIds: [...new Set([...queue, ...waiting].flatMap(({ line }) => getCompareIds(line)))],
      phase,
      skipped,
    }),
  );
  return {
    areas,
    changes: readGenshinChanges(readProposalFiles()),
    exit: await readGenshinExitReadings(areas),
    roadmap: parseRoadmapItems(readFileSync(resolve(REPOSITORY_ROOT, GENSHIN_ROADMAP_FILE), "utf8")),
    scriptedQuests: readScriptedQuestIds(),
  };
};
