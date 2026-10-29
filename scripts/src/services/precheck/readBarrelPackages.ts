import type { ChangedFile } from "#src/models/queue/ChangedFile";

import { ChangeStatus } from "#src/models/queue/ChangeStatus";

// A package whose source gained or lost a file has a barrel that may now be stale, so each is named once. A file that
// Only changed in place leaves the barrel right, since `export *` re-exports whatever the module holds
export const readBarrelPackages = (changedFiles: ChangedFile[]): string[] => {
  const packageDirectories = changedFiles
    .filter(({ status }) => status === ChangeStatus.Added || status === ChangeStatus.Deleted)
    .map(({ path }) => /^(?<packageDirectory>packages\/[^/]+)\/src\//u.exec(path)?.groups?.packageDirectory)
    .filter((packageDirectory) => packageDirectory !== undefined);
  return [...new Set(packageDirectories)].toSorted();
};
