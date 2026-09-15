import type { ExpressInput } from "#src/models/coderabbit/collect/ExpressInput";
import type { ExpressResult } from "#src/models/coderabbit/collect/ExpressResult";

import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { checkIsMechanicalCommit } from "#src/services/coderabbit/exclusions/checkIsMechanicalCommit";
import { checkIsMechanicalRange } from "#src/services/coderabbit/exclusions/checkIsMechanicalRange";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// The express lane: a commit that is all files and no findings — a sweep's moves and the imports that follow
// Them — goes straight to `main`, out of queue order, and the return stroke carries it to `develop`. A commit
// Whose parent is not on `main` yet cannot apply, which is how dependency is enforced. The lane is closed unless
// `develop` and `main` agree: a rename landing on one side of the merge an unreviewed window still owes is how
// A file arrives twice.
export const portExpress = ({ cwd, developSha, mainSha, queueSha }: ExpressInput): ExpressResult => {
  if (developSha !== mainSha) return { shas: [] };

  const mechanicalShas = readCherryShas(developSha, queueSha, cwd).filter((sha) => checkIsMechanicalCommit(sha, cwd));
  if (mechanicalShas.length === 0) return { shas: [] };

  runGit(["switch", "--detach", mainSha], cwd);
  const shas = mechanicalShas.filter((sha) => pickCommit(sha, cwd) === PickOutcome.Applied);
  if (shas.length === 0) return { shas };

  // Asked again of the cut: what ships is each patch replayed onto `main` and stacked with siblings taken out of
  // Order, which is not the diff the per-commit proof saw. A cut that fails takes the review lane instead.
  if (checkIsMechanicalRange([mainSha, "HEAD"], cwd)) return { shas, targetSha: readHeadSha(cwd) };

  runGit(["switch", "--detach", mainSha], cwd);
  console.info("express: the cut is not mechanical as it lands — it takes the review lane instead");
  return { shas: [] };
};
