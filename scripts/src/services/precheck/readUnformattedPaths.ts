import type { ChangedFile } from "#src/models/queue/ChangedFile";

import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { checkIsComponentPath } from "#src/services/format/checkIsComponentPath";
import { checkIsRewritten } from "#src/services/format/checkIsRewritten";
import { chunkPaths } from "#src/services/format/chunkPaths";
import { listDifferent } from "#src/services/format/listDifferent";
import { readFormattableText } from "#src/services/format/readFormattableText";
import { readFormattedSource } from "#src/services/format/readFormattedSource";

// The changed files the repository's formatters would rewrite, in the order given. A file type neither has a parser
// For is skipped, as the pre-commit hook skips it. A file one cannot parse stops the check with the formatter's own
// Message, since that is a file no format can fix. Oxfmt runs once per run of paths, not once per file. A run it cannot
// Finish is checked one file at a time, so the first file that stops it is the one named, as it was before runs. A
// Component is vize's, which oxfmt ignores, so it is checked one file at a time too
export const readUnformattedPaths = (
  changedFiles: ChangedFile[],
  repositoryRoot: string,
  mainCheckoutRoot: string,
): string[] => {
  const paths = changedFiles
    .filter(({ status }) => status !== ChangeStatus.Deleted)
    .map(({ path }) => path)
    .filter((path) => readFormattableText(path, repositoryRoot) !== undefined);
  const checkIsUnformatted = (path: string) =>
    checkIsRewritten(readFormattedSource(path, repositoryRoot, mainCheckoutRoot));
  const unformattedPaths = new Set([
    ...paths.filter((path) => checkIsComponentPath(path) && checkIsUnformatted(path)),
    ...chunkPaths(paths.filter((path) => !checkIsComponentPath(path))).flatMap(
      (chunk) =>
        listDifferent(chunk, repositoryRoot, mainCheckoutRoot) ?? chunk.filter((path) => checkIsUnformatted(path)),
    ),
  ]);
  return paths.filter((path) => unformattedPaths.has(path));
};
