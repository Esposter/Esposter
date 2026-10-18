import { PRODUCT_REVIEW_SUBJECT_PREFIX, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getOwedReviews } from "#src/services/proposals/getOwedReviews";
import { getProductReviewPasses } from "#src/services/proposals/getProductReviewPasses";
import { getProposalShips } from "#src/services/proposals/getProposalShips";
import { readProposalSummaries } from "#src/services/proposals/readProposalSummaries";
import { runGit } from "#src/services/shared/runGit";
import { timeCommand } from "#src/services/timing/runCommand";

timeCommand("ai:proposals:report");

// `pnpm ai:proposals:report` — every open proposal sized from what its design already says, cheapest first, then the
// Areas a ship has moved since their last product-review pass. Nothing it prints is kept anywhere by hand
// (`building-proposals` skill, `references/choosing.md`). Both logs read the committer date, the one a rebase onto the
// Queue moves and an author date never does, so only the committer date follows history. Archiving a change is a move,
// So the ship log reads it with renames off, as the deletion it is from the changes root.
for (const { blockerIds, hasKeyFiles, id, keyFileCount, signals } of readProposalSummaries()) {
  const size = hasKeyFiles ? `${keyFileCount} files` : "unsized";
  const costs = signals.length > 0 ? ` · ${signals.join(" · ")}` : "";
  const blockers = blockerIds.length > 0 ? ` · after ${blockerIds.join(", ")}` : "";
  console.info(`${id}: ${size}${costs}${blockers}`);
}

const shipLog = runGit([
  "log",
  "--no-renames",
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
