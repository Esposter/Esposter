import type { ExpressCutInput } from "#src/models/coderabbit/collect/ExpressCutInput";
import type { ExpressResult } from "#src/models/coderabbit/collect/ExpressResult";

import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { runGit } from "#src/services/shared/runGit";

// The express lane's cut: a commit that claims it needs no review — the trailer the reshaper writes on the parts
// It judged so, or a session on its own commit — goes straight to `main`, out of queue order and unverified;
// The fold carries `main` into the next window and the sync drops the original from the queue by the copy
// That names it. A commit whose patch needs an unported one cannot apply, which is how dependency is enforced —
// Never an ancestry check.
export const portExpress = ({ cwd, mainSha, shas }: ExpressCutInput): ExpressResult => {
  if (shas.length === 0) return { shas: [] };

  runGit(["switch", "--detach", mainSha], cwd);
  const appliedShas = shas.filter((sha) => pickCommit(sha, cwd) === PickOutcome.Applied);
  return appliedShas.length === 0 ? { shas: appliedShas } : { shas: appliedShas, targetSha: readHeadSha(cwd) };
};
