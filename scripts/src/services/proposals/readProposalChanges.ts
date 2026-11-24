import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { ProposalChange } from "#src/models/proposals/ProposalChange";

import { parseProposalMetadata } from "#src/services/fleet/parseProposalMetadata";
import { parseProposalTasks } from "#src/services/fleet/parseProposalTasks";
import { compareProposalSummaries } from "#src/services/proposals/compareProposalSummaries";
import { computeProposalSummary } from "#src/services/proposals/computeProposalSummary";
import {
  ARCHIVE_FOLDER,
  PROGRAM_SUFFIX,
  PROPOSAL_DESIGN_FILE,
  PROPOSAL_METADATA_FILE,
  PROPOSAL_TASKS_FILE,
  PROPOSALS_DIRECTORY,
} from "#src/services/proposals/constants";
import { getProposalId } from "#src/services/proposals/getProposalId";

// Every open proposal's change, cheapest first, read once from the change files given. A change is open while its
// Folder sits directly under the changes root, and a unit to build when it has a design; a program is the umbrella over
// The changes sharing its prefix, so it is an id a change may wait on but never a unit itself. Its metadata is parsed
// Here, once, and its tasks are read against that metadata's phase, so the phase it is picked at is the lowest among
// Its open tasks
export const readProposalChanges = (files: readonly QueueFile[]): ProposalChange[] => {
  const openFiles = files.filter(({ path }) => getProposalId(path) !== ARCHIVE_FOLDER);
  const openIds = new Set(openFiles.map(({ path }) => getProposalId(path)));
  const pathTextMap = new Map(openFiles.map(({ path, text }) => [path, text]));
  return openFiles
    .filter(({ path }) => {
      const id = getProposalId(path);
      return path === `${PROPOSALS_DIRECTORY}/${id}/${PROPOSAL_DESIGN_FILE}` && !id.endsWith(PROGRAM_SUFFIX);
    })
    .map(({ path, text }) => {
      const id = getProposalId(path);
      const getChangeText = (file: string) => pathTextMap.get(`${PROPOSALS_DIRECTORY}/${id}/${file}`) ?? "";
      const metadata = parseProposalMetadata(getChangeText(PROPOSAL_METADATA_FILE));
      const { pickPhase, tasks } = parseProposalTasks(getChangeText(PROPOSAL_TASKS_FILE), metadata.phase);
      return {
        design: text,
        metadata,
        summary: { ...computeProposalSummary(id, text, openIds), phase: pickPhase },
        tasks,
      };
    })
    .toSorted((firstChange, secondChange) => compareProposalSummaries(firstChange.summary, secondChange.summary));
};
