import type { DumpFile } from "#src/models/genshinText/DumpFile";

// The remote files a fetch still has to download: each one whose local copy is missing or not the size the remote holds
export const selectDumpFiles = (
  remoteFiles: readonly DumpFile[],
  localSizeMap: ReadonlyMap<string, number>,
): DumpFile[] => remoteFiles.filter(({ path, size }) => localSizeMap.get(path) !== size);
