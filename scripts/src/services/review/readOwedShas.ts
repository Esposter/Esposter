import type { ReviewRange } from "#src/models/review/ReviewRange";

import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The commits owed, oldest first, along the first-parent line between two refs. `--ancestry-path` is not used: it combines
// With `--first-parent` into an empty list whenever `from` is reached only through a merge's second parent, which is how
// `main` is reached from `ai/queue`, so the steady run reviewed nothing.
export const readOwedShas = ({ from, to }: ReviewRange, cwd?: string): string[] =>
  getNonEmptyLines(runGit(["rev-list", "--reverse", "--first-parent", `${from}..${to}`], cwd));
