import type { ChangedFile } from "#src/models/queue/ChangedFile";

// A package whose source changed in any way may have a stale barrel, so each is named once. A file changed in place can
// Still move a barrel, since a module is listed only when it exports something, which an edit can add or take away
export const readBarrelPackages = (changedFiles: ChangedFile[]): string[] => {
  const packageDirectories = changedFiles
    .map(({ path }) => /^(?<packageDirectory>packages\/[^/]+)\/src\//u.exec(path)?.groups?.packageDirectory)
    .filter((packageDirectory) => packageDirectory !== undefined);
  return [...new Set(packageDirectories)].toSorted();
};
