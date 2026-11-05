import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { ProposalChange } from "#src/models/proposals/ProposalChange";

import { parseProposalMetadata } from "#src/services/fleet/parseProposalMetadata";
import { parseProposalTasks } from "#src/services/fleet/parseProposalTasks";
import { compareProposalSummaries } from "#src/services/proposals/compareProposalSummaries";
import {
  ARCHIVE_FOLDER,
  PROGRAM_SUFFIX,
  PROPOSAL_DESIGN_FILE,
  PROPOSAL_METADATA_FILE,
  PROPOSAL_TASKS_FILE,
  PROPOSALS_DIRECTORY,
} from "#src/services/proposals/constants";
import { getProposalId } from "#src/services/proposals/getProposalId";
import { getProposalSummary } from "#src/services/proposals/getProposalSummary";

// Every open proposal's change, cheapest first, read once from the change files given. A change is open while its folder
// Sits directly under the changes root, and a unit to build when it has a design; a program is the umbrella over the changes
// Sharing its prefix, so it is an id a change may wait on but never a unit itself. Its metadata is parsed here, once, and its
// Tasks are read against that metadata's phase, so the phase it is picked at is the lowest among its open tasks
export const readProposalChanges = (files: readonly QueueFile[]): ProposalChange[] => {
  const openFiles = files.filter(({ path }) => getProposalId(path) !== ARCHIVE_FOLDER);
  const openIds = new Set(openFiles.map(({ path }) => getProposalId(path)));
  const textMap = new Map(openFiles.map(({ path, text }) => [path, text]));
  return openFiles
    .filter(({ path }) => {
      const id = getProposalId(path);
      return path === `${PROPOSALS_DIRECTORY}/${id}/${PROPOSAL_DESIGN_FILE}` && !id.endsWith(PROGRAM_SUFFIX);
    })
    .map(({ path, text }) => {
      const id = getProposalId(path);
      const changeText = (file: string) => textMap.get(`${PROPOSALS_DIRECTORY}/${id}/${file}`) ?? "";
      const metadata = parseProposalMetadata(changeText(PROPOSAL_METADATA_FILE));
      const { pickPhase } = parseProposalTasks(changeText(PROPOSAL_TASKS_FILE), metadata.phase);
      return { design: text, metadata, summary: { ...getProposalSummary(id, text, openIds), phase: pickPhase } };
    })
    .toSorted((firstChange, secondChange) => compareProposalSummaries(firstChange.summary, secondChange.summary));
};
