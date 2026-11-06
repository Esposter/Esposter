import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { GenshinChange } from "#src/models/genshinProgress/GenshinChange";

import { GENSHIN_FLEET_AREA } from "#src/services/fleet/constants";
import { getProposalArea } from "#src/services/proposals/getProposalArea";
import { readProposalChanges } from "#src/services/proposals/readProposalChanges";

// Every open change of the Genshin area, with its metadata's needs, blocker and phase and its task list, each task
// Holding its marker's phase or else the change's
export const readGenshinChanges = (files: readonly QueueFile[]): GenshinChange[] =>
  readProposalChanges(files)
    .filter(({ summary: { id } }) => getProposalArea(id) === GENSHIN_FLEET_AREA)
    .map(({ metadata: { needs, phase, waiting }, tasks }) => ({ needs, phase, tasks, waiting }));
