import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { compareProposalSummaries } from "#src/services/proposals/compareProposalSummaries";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getProposalRoute } from "#src/services/proposals/getProposalRoute";
import { getProposalSummary } from "#src/services/proposals/getProposalSummary";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MARKDOWN_EXTENSION = ".md";

// The proposal files in the working tree, with the ones written and not yet added
const readProposalFiles = (): QueueFile[] =>
  readSweepFilePaths(`${PROPOSALS_DIRECTORY}/**/*.md`).map((path) => ({
    path,
    text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"),
  }));

// Every open proposal, cheapest first, from the proposal files given, the working tree's when none are. A folder's
// `index.md` is the umbrella over its sub-specs — the decision and the build order — so it is a route a sub-spec may wait
// On but never a unit to build itself.
export const readProposalSummaries = (files: readonly QueueFile[] = readProposalFiles()): ProposalSummary[] => {
  const proposals = files.filter(({ path }) => path.endsWith(MARKDOWN_EXTENSION));
  const openRoutes = new Set(proposals.map(({ path }) => getProposalRoute(path)));
  return proposals
    .filter(({ path }) => !path.endsWith("/index.md"))
    .map(({ path, text }) => getProposalSummary(path, text, openRoutes))
    .toSorted((firstSummary, secondSummary) => compareProposalSummaries(firstSummary, secondSummary));
};
