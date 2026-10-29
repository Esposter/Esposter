import type { ChangedFile } from "#src/models/queue/ChangedFile";

import { ChangeStatus } from "#src/models/queue/ChangeStatus";

// `git diff --name-status -z` writes a status letter and a path, each NUL-terminated. A letter other than the added or
// The deleted one is a modification of the file it names, which is all a landing needs to tell apart
export const parseNameStatus = (output: string): ChangedFile[] => {
  const fields = output.split("\0");
  const changedFiles: ChangedFile[] = [];
  for (let index = 0; index + 1 < fields.length; index += 2) {
    const letter = fields[index];
    const path = fields[index + 1];
    if (letter === undefined || path === undefined) break;
    const status =
      [ChangeStatus.Added, ChangeStatus.Deleted, ChangeStatus.Modified].find((known) => known === letter) ??
      ChangeStatus.Modified;
    changedFiles.push({ path, status });
  }
  return changedFiles;
};
