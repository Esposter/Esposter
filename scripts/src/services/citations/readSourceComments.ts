import type { CitingPage } from "#src/models/shared/CitingPage";

import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readSourceEntries } from "#src/services/sweeps/staleNames/readSourceEntries";

// The comments of every source file the stale-names scan reads, each as a page of its own, so the judgement a page's
// Citations get reads them the same way. A generated file is left out, as its words are
export const readSourceComments = (): CitingPage[] =>
  Object.entries(readSourceEntries(readSweepFilePaths(".")).entries).map(([path, { comments }]) => ({
    path,
    text: comments.join("\n"),
  }));
