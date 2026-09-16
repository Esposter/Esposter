import type { ExpressInput } from "#src/models/coderabbit/collect/ExpressInput";
import type { ExpressResult } from "#src/models/coderabbit/collect/ExpressResult";

import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readExpressShas } from "#src/services/coderabbit/collect/readExpressShas";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// The express lane: a commit that claims it needs no review — the trailer the reshaper writes on the parts it
// Judged so, or a session on its own commit — goes straight to `main`, out of queue order, once the checks pass;
// The fold carries `main` into the next window and the sync drops the original from the queue by the copy that
// Names it. Owed to both `main` and `develop`: a copy a window already carries is not cut again. A commit whose
// Patch needs an unported one cannot apply, which is how dependency is enforced — never an ancestry check.
export const portExpress = ({ cwd, developSha, mainSha, queueSha }: ExpressInput): ExpressResult => {
  const owedToDevelop = new Set(readCherryShas(developSha, queueSha, cwd));
  const owedToMain = readCherryShas(mainSha, queueSha, cwd);
  const claimedShas = readExpressShas(owedToMain, cwd);
  const expressShas = owedToMain.filter((sha) => owedToDevelop.has(sha) && claimedShas.has(sha));
  if (expressShas.length === 0) return { shas: [] };

  runGit(["switch", "--detach", mainSha], cwd);
  const shas = expressShas.filter((sha) => pickCommit(sha, cwd) === PickOutcome.Applied);
  return shas.length === 0 ? { shas } : { shas, targetSha: readHeadSha(cwd) };
};
