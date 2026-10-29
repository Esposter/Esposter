import type { DumpFile } from "#src/models/genshinText/DumpFile";

// The remote files a fetch still has to download: each one whose local copy is missing or holds other content. A table
// Whose hashes changed digits keeps its size, so the content decides, never the size
export const selectDumpFiles = (
  remoteFiles: readonly DumpFile[],
  localShaMap: ReadonlyMap<string, string>,
): DumpFile[] => remoteFiles.filter(({ path, sha }) => localShaMap.get(path) !== sha);
