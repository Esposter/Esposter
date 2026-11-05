import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { GenshinChange } from "#src/models/genshinProgress/GenshinChange";

import { GENSHIN_FLEET_AREA } from "#src/services/fleet/constants";
import { parseProposalMetadata } from "#src/services/fleet/parseProposalMetadata";
import { parseProposalTasks } from "#src/services/fleet/parseProposalTasks";
import { PROPOSAL_METADATA_FILE, PROPOSAL_TASKS_FILE, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getProposalArea } from "#src/services/proposals/getProposalArea";
import { readProposalSummaries } from "#src/services/proposals/readProposalSummaries";

// Every open change of the Genshin area, with its metadata's needs, blocker and phase and its task list, each task
// Holding its marker's phase or else the change's
export const readGenshinChanges = (files: readonly QueueFile[]): GenshinChange[] => {
  const pathTextMap = new Map(files.map(({ path, text }) => [path, text]));
  return readProposalSummaries(files)
    .filter(({ id }) => getProposalArea(id) === GENSHIN_FLEET_AREA)
    .map(({ id }) => {
      const changeText = (file: string) => pathTextMap.get(`${PROPOSALS_DIRECTORY}/${id}/${file}`) ?? "";
      const { needs, phase, waiting } = parseProposalMetadata(changeText(PROPOSAL_METADATA_FILE));
      const { tasks } = parseProposalTasks(changeText(PROPOSAL_TASKS_FILE), phase);
      return { needs, phase, tasks, waiting };
    });
};
