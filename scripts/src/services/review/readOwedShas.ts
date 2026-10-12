import type { ReviewRange } from "#src/models/review/ReviewRange";

import { ReviewMode } from "#src/models/review/ReviewMode";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The commits owed, oldest first, along the first-parent line. Steady mode reads the commits past `main` on `ai/queue`
// (`--ancestry-path` keeps the ones descending from `main`); range mode reads the commits between two shas.
export const readOwedShas = ({ from, mode, to }: ReviewRange): string[] => {
  const ancestryArguments = mode === ReviewMode.Steady ? ["--ancestry-path"] : [];
  return getNonEmptyLines(runGit(["rev-list", "--reverse", "--first-parent", ...ancestryArguments, `${from}..${to}`]));
};
