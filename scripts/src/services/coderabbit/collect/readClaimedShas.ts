import type { ExpressInput } from "#src/models/coderabbit/collect/ExpressInput";

import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";

// The queue commits the express lane may cut: claiming no review, and owed to both `main` and `develop` — a copy
// A window already carries is not cut again
export const readClaimedShas = ({ cwd, developSha, mainSha, queueSha }: ExpressInput): string[] => {
  const owedToDevelop = new Set(readCherryShas(developSha, queueSha, cwd));
  const owedToMain = readCherryShas(mainSha, queueSha, cwd);
  const claimedShas = readTrailedShas(owedToMain, EXPRESS_TRAILER, cwd);
  return owedToMain.filter((sha) => owedToDevelop.has(sha) && claimedShas.has(sha));
};
