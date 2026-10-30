import type { ChangedFile } from "#src/models/queue/ChangedFile";

import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { readFormattedSource } from "#src/services/format/readFormattedSource";

// The changed files the repository's formatter would rewrite. A file type it has no parser for is skipped, as the pre-commit
// Hook skips it. A file it cannot parse stops the check with the formatter's own message, since that is a file no format
// Can fix
export const readUnformattedPaths = (
  changedFiles: ChangedFile[],
  repositoryRoot: string,
  mainCheckoutRoot: string,
): string[] =>
  changedFiles
    .filter(({ status }) => status !== ChangeStatus.Deleted)
    .filter(({ path }) => {
      const source = readFormattedSource(path, repositoryRoot, mainCheckoutRoot);
      return source !== undefined && source.formatted !== source.original;
    })
    .map(({ path }) => path);
