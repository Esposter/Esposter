import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

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
import { readProposalFiles } from "#src/services/proposals/readProposalFiles";

// Every open proposal, cheapest first, from the change files given, the working tree's when none are. A change is open
// While its folder sits directly under the changes root, and a unit to build when it has a design; a program is the
// Umbrella over the changes sharing its prefix, so it is an id a change may wait on but never a unit itself. Each carries
// The phase it is picked at, read off its tasks and its metadata's x-phase
export const readProposalSummaries = (files: readonly QueueFile[] = readProposalFiles()): ProposalSummary[] => {
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
      const { phase } = parseProposalMetadata(changeText(PROPOSAL_METADATA_FILE));
      const { pickPhase } = parseProposalTasks(changeText(PROPOSAL_TASKS_FILE), phase);
      return { ...getProposalSummary(id, text, openIds), phase: pickPhase };
    })
    .toSorted((firstSummary, secondSummary) => compareProposalSummaries(firstSummary, secondSummary));
};
