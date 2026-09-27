import { PRODUCT_REVIEW_SUBJECT_PREFIX, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getOwedReviews } from "#src/services/proposals/getOwedReviews";
import { getProductReviewPasses } from "#src/services/proposals/getProductReviewPasses";
import { getProposalShips } from "#src/services/proposals/getProposalShips";
import { readProposalSummaries } from "#src/services/proposals/readProposalSummaries";
import { runGit } from "#src/services/shared/runGit";

// `pnpm ai:proposals:report` — every open proposal sized from what its page already says, cheapest first, then the
// Areas a ship has moved since their last product-review pass. Nothing it prints is kept anywhere by hand
// (`building-proposals` skill, `references/choosing.md`). Both logs read the committer date: every commit reaches
// `develop` by cherry-pick, which keeps its author date, so only the commit date follows history.
for (const { blockerRoutes, hasKeyFiles, keyFileCount, path, signals } of readProposalSummaries()) {
  const size = hasKeyFiles ? `${keyFileCount} files` : "unsized";
  const costs = signals.length > 0 ? ` · ${signals.join(" · ")}` : "";
  const blockers = blockerRoutes.length > 0 ? ` · after ${blockerRoutes.join(", ")}` : "";
  console.info(`${path.slice(PROPOSALS_DIRECTORY.length + 1)}: ${size}${costs}${blockers}`);
}

const shipLog = runGit([
  "log",
  "--diff-filter=D",
  "--name-only",
  "--format=%x1E%H%x1F%ct%x1F%cs%x1F",
  "--",
  PROPOSALS_DIRECTORY,
]);
const passLog = runGit([
  "log",
  "--fixed-strings",
  `--grep=${PRODUCT_REVIEW_SUBJECT_PREFIX}`,
  "--format=%H%x1F%ct%x1F%cs%x1F%s%x1E",
]);
const ships = getProposalShips(shipLog);
const passes = getProductReviewPasses(passLog);
for (const { area, lastPassDate, lastShipDate } of getOwedReviews(ships, passes))
  console.info(`owed a product-review pass: ${area} (shipped ${lastShipDate}, last pass ${lastPassDate || "never"})`);
