import type { FileEntry } from "#src/models/fleet/data/FileEntry";

// The source's files the target lacks or holds at another size or mtime; files only the target has are left alone
export const selectChangedFiles = (source: FileEntry[], target: FileEntry[]): FileEntry[] => {
  const targetFiles = new Map(target.map((file): [string, FileEntry] => [file.name, file]));
  return source.filter((file) => {
    const targetFile = targetFiles.get(file.name);
    return targetFile === undefined || targetFile.size !== file.size || targetFile.mtime !== file.mtime;
  });
};
