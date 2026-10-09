import { readSha } from "#src/services/coderabbit/collect/readSha";
import { runGit } from "#src/services/shared/runGit";

// The parent whose tree is the head's own — the reviewed `develop` head a release merged, since the fold left
// `develop` carrying all of `main` — so CI's verdict on it is the head's verdict, already reached during the review
export const readSameTreeParentSha = (mainSha: string, cwd: string): string | undefined => {
  const [, ...parentShas] = runGit(["rev-list", "--parents", "--max-count=1", mainSha], cwd).trim().split(" ");
  const treeSha = readSha(`${mainSha}^{tree}`, cwd);
  return parentShas.find((parentSha) => readSha(`${parentSha}^{tree}`, cwd) === treeSha);
};
