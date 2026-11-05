import type { GenshinUnits } from "#src/models/genshinProgress/GenshinUnits";

import { readComputeAreas } from "#src/services/fleet/readComputeAreas";
import { readComputeFiles } from "#src/services/fleet/readComputeFiles";
import { GENSHIN_ROADMAP_FILE } from "#src/services/genshinProgress/constants";
import { parseRoadmapItems } from "#src/services/genshinProgress/parseRoadmapItems";
import { readGenshinChanges } from "#src/services/genshinProgress/readGenshinChanges";
import { readProposalFiles } from "#src/services/proposals/readProposalFiles";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every unit the report counts, each source read once off the working tree: the compute pages, the changes and the
// Roadmap
export const readGenshinUnits = (): GenshinUnits => ({
  areas: readComputeAreas(readComputeFiles()).map(({ kind, phase, queue, waiting }) => ({
    blockers: waiting.map(({ waiting: blocker }) => blocker),
    kind,
    needs: queue.map(({ needs }) => needs),
    phase,
  })),
  changes: readGenshinChanges(readProposalFiles()),
  roadmap: parseRoadmapItems(readFileSync(resolve(REPOSITORY_ROOT, GENSHIN_ROADMAP_FILE), "utf8")),
});
