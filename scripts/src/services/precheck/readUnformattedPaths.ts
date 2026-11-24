import type { ChangedFile } from "#src/models/queue/ChangedFile";

import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { checkIsRewritten } from "#src/services/format/checkIsRewritten";
import { chunkPaths } from "#src/services/format/chunkPaths";
import { listDifferent } from "#src/services/format/listDifferent";
import { readFormattableText } from "#src/services/format/readFormattableText";
import { readFormattedSource } from "#src/services/format/readFormattedSource";

// The changed files the repository's formatter would rewrite, in the order given. A file type it has no parser for is
// Skipped, as the pre-commit hook skips it. A file it cannot parse stops the check with the formatter's own message,
// Since that is a file no format can fix. The formatter runs once per run of paths, not once per file. A run it cannot
// Finish is checked one file at a time, so the first file that stops it is the one named, as it was before runs
export const readUnformattedPaths = (
  changedFiles: ChangedFile[],
  repositoryRoot: string,
  mainCheckoutRoot: string,
): string[] =>
  chunkPaths(
    changedFiles
      .filter(({ status }) => status !== ChangeStatus.Deleted)
      .map(({ path }) => path)
      .filter((path) => readFormattableText(path, repositoryRoot) !== undefined),
  ).flatMap(
    (chunk) =>
      listDifferent(chunk, repositoryRoot, mainCheckoutRoot) ??
      chunk.filter((path) => checkIsRewritten(readFormattedSource(path, repositoryRoot, mainCheckoutRoot))),
  );
