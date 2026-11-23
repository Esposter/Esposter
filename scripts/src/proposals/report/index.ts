import { computeOwedReviews } from "#src/services/proposals/computeOwedReviews";
import { computeProposalShips } from "#src/services/proposals/computeProposalShips";
import { PRODUCT_REVIEW_SUBJECT_PREFIX, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getProductReviewPasses } from "#src/services/proposals/getProductReviewPasses";
import { groupProposalsByPhase } from "#src/services/proposals/groupProposalsByPhase";
import { readProposalSummaries } from "#src/services/proposals/readProposalSummaries";
import { runGit } from "#src/services/shared/runGit";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:proposals:report` — every open proposal sized from what its design already says, grouped by phase, cheapest
// First within each, then the areas a ship has moved since their last product-review pass. Nothing it prints is kept
// Anywhere by hand (`building-proposals` skill, `references/choosing.md`).
await runCommand(
  defineCommand({
    meta: {
      description:
        "List every open proposal sized from its design, grouped by phase, and the areas owed a product-review pass",
      name: "ai:proposals:report",
    },
    run: () => {
      for (const { heading, summaries } of groupProposalsByPhase(readProposalSummaries())) {
        console.info(`\n${heading}`);
        for (const { blockerIds, hasKeyFiles, id, keyFileCount, signals } of summaries) {
          const size = hasKeyFiles ? `${keyFileCount} files` : "unsized";
          const costs = signals.length > 0 ? ` · ${signals.join(" · ")}` : "";
          const blockers = blockerIds.length > 0 ? ` · after ${blockerIds.join(", ")}` : "";
          console.info(`${id}: ${size}${costs}${blockers}`);
        }
      }

      // Both logs read the committer date, the one a Rebase onto the Queue moves and an author date never does, so Only
      // The committer date follows history. Archiving a Change is a move, so the ship log reads it with renames off, As
      // The deletion it is from the changes root.
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
      const ships = computeProposalShips(shipLog);
      const passes = getProductReviewPasses(passLog);
      for (const { area, lastPassDate, lastShipDate } of computeOwedReviews(ships, passes))
        console.info(
          `owed a product-review pass: ${area} (shipped ${lastShipDate}, last pass ${lastPassDate || "never"})`,
        );
    },
  }),
);
