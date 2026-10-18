import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { compareProposalSummaries } from "#src/services/proposals/compareProposalSummaries";
import {
  ARCHIVE_FOLDER,
  PROGRAM_SUFFIX,
  PROPOSAL_DESIGN_FILE,
  PROPOSALS_DIRECTORY,
} from "#src/services/proposals/constants";
import { getProposalId } from "#src/services/proposals/getProposalId";
import { getProposalSummary } from "#src/services/proposals/getProposalSummary";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The changes' designs in the working tree, with the ones written and not yet added
const readProposalFiles = (): QueueFile[] =>
  readSweepFilePaths(`${PROPOSALS_DIRECTORY}/*/${PROPOSAL_DESIGN_FILE}`).map((path) => ({
    path,
    text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"),
  }));

// Every open proposal, cheapest first, from the change files given, the working tree's when none are. A change is open
// While its folder sits directly under the changes root, and a unit to build when it has a design; a program is the
// Umbrella over the changes sharing its prefix, so it is an id a change may wait on but never a unit itself
export const readProposalSummaries = (files: readonly QueueFile[] = readProposalFiles()): ProposalSummary[] => {
  const openFiles = files.filter(({ path }) => getProposalId(path) !== ARCHIVE_FOLDER);
  const openIds = new Set(openFiles.map(({ path }) => getProposalId(path)));
  return openFiles
    .filter(({ path }) => {
      const id = getProposalId(path);
      return path === `${PROPOSALS_DIRECTORY}/${id}/${PROPOSAL_DESIGN_FILE}` && !id.endsWith(PROGRAM_SUFFIX);
    })
    .map(({ path, text }) => getProposalSummary(getProposalId(path), text, openIds))
    .toSorted((firstSummary, secondSummary) => compareProposalSummaries(firstSummary, secondSummary));
};
