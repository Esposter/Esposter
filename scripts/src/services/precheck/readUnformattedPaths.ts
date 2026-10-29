import type { ChangedFile } from "#src/models/queue/ChangedFile";

import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { readFormattedSource } from "#src/services/format/readFormattedSource";

// The changed files the repository's formatter would rewrite. A file it cannot parse stops the check with the formatter's
// Own message, since that is a file no format can fix
export const readUnformattedPaths = (changedFiles: ChangedFile[], mainCheckoutRoot: string): string[] =>
  changedFiles
    .filter(({ status }) => status !== ChangeStatus.Deleted)
    .filter(({ path }) => {
      const source = readFormattedSource(path, mainCheckoutRoot);
      return source !== undefined && source.formatted !== source.original;
    })
    .map(({ path }) => path);
