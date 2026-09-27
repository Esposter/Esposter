import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { compareProposalSummaries } from "#src/services/proposals/compareProposalSummaries";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getProposalRoute } from "#src/services/proposals/getProposalRoute";
import { getProposalSummary } from "#src/services/proposals/getProposalSummary";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every open proposal, cheapest first. A folder's `index.md` is the umbrella over its sub-specs — the decision and
// The build order — so it is a route a sub-spec may wait on but never a unit to build itself.
export const readProposalSummaries = (): ProposalSummary[] => {
  const paths = readSweepFilePaths(`${PROPOSALS_DIRECTORY}/**/*.md`);
  const openRoutes = new Set(paths.map((path) => getProposalRoute(path)));
  return paths
    .filter((path) => !path.endsWith("/index.md"))
    .map((path) => getProposalSummary(path, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"), openRoutes))
    .toSorted(compareProposalSummaries);
};
