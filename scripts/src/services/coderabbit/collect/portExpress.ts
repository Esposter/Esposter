import type { ExpressInput } from "#src/models/coderabbit/collect/ExpressInput";
import type { ExpressResult } from "#src/models/coderabbit/collect/ExpressResult";

import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { checkIsMechanicalCommit } from "#src/services/coderabbit/exclusions/checkIsMechanicalCommit";
import { checkIsMechanicalRange } from "#src/services/coderabbit/exclusions/checkIsMechanicalRange";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// The express lane. A review window is budgeted in files and spent on findings, so a commit that is all files and
// No findings — a folder sweep's moves and the imports that follow them — is the one thing that should never
// Occupy one. These go straight to `main`: the return stroke carries them to `develop` on the next run, and the
// Session's rebase drops them by patch id, so nothing else in the pipeline learns a new shape.
//
// Out of queue order on purpose, and this is the whole answer to a fix that wants to jump the queue. A mechanical
// Commit stuck behind unported work is exactly the one worth taking early, and a commit whose subject is not on
// `main` yet simply cannot apply — the pick refuses it and the lane moves on. Dependency is enforced by whether
// The patch lands, which is a fact, rather than by an order someone has to maintain.
//
// The lane is closed unless `develop` and `main` agree. An unreviewed window on `develop` still has to merge back
// Into a `main` these commits have moved under it, and a rename landing on one side of that merge is how a file
// Arrives twice. At rest there is no such merge to lose, and a mechanical commit is never the urgent one.
export const portExpress = ({ cwd, developSha, mainSha, queueSha }: ExpressInput): ExpressResult => {
  if (developSha !== mainSha) return { shas: [] };

  const mechanicalShas = readCherryShas(developSha, queueSha, cwd).filter((sha) => checkIsMechanicalCommit(sha, cwd));
  if (mechanicalShas.length === 0) return { shas: [] };

  runGit(["switch", "--detach", mainSha], cwd);
  const shas = mechanicalShas.filter((sha) => pickCommit(sha, cwd) === PickOutcome.Applied);
  if (shas.length === 0) return { shas };

  // The proof is asked again of the cut, because the commits it selected are not the commits it pushes. Each was
  // Classified as its author wrote it, on a parent from the queue; what ships is that patch replayed onto `main`
  // And stacked with the siblings the lane took out of order, which a cherry-pick may resolve into something the
  // Per-commit proof never saw. The cumulative diff is also the unit a reviewer reads, so it is the honest one to
  // Claim has nothing in it. A cut that fails simply takes the review lane, where a person sees why.
  if (checkIsMechanicalRange([mainSha, "HEAD"], cwd))
    return { shas, targetSha: runGit(["rev-parse", "HEAD"], cwd).trim() };

  runGit(["switch", "--detach", mainSha], cwd);
  console.info("express: the cut is not mechanical as it lands — it takes the review lane instead");
  return { shas: [] };
};
