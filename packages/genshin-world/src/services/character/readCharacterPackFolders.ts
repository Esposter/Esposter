import type { PickedCharacterPack } from "#src/models/character/PickedCharacterPack";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The releases in an extracted folder picked, each a file the browser reads only when asked for: the folder itself as one
// Release, or, when it holds only folders and each of them holds a model, each of those folders as a release of its own.
// Each file keeps its path from the folder picked, which every release's paths share. A release only shipped as a RAR, as
// Lumine's of 2020 is, is read this way once the player extracts it
export const readCharacterPackFolders = (files: readonly File[]): PickedCharacterPack[] => {
  const pathFileMap = new Map(files.map((file) => [file.webkitRelativePath || file.name, file]));
  const paths = [...pathFileMap.keys()];
  const [folderName = ""] = paths[0]?.split("/") ?? [];
  const folderPathsMap = Map.groupBy(paths, (path) => path.split("/")[1] ?? "");
  const isFolderOfReleases =
    paths.every((path) => path.split("/").length > 2) &&
    [...folderPathsMap.values()].every((folderPaths) =>
      folderPaths.some((path) => path.toLowerCase().endsWith(".pmx")),
    );
  const releases = isFolderOfReleases
    ? Array.from(folderPathsMap, ([name, releasePaths]) => ({ name, paths: releasePaths }))
    : [{ name: folderName, paths }];
  return releases.map(({ name, paths: releasePaths }) => ({
    name,
    paths: releasePaths,
    readFiles: (requestedPaths) =>
      requestedPaths.map((path) => {
        const file = pathFileMap.get(path);
        if (file === undefined) throw new InvalidOperationError(Operation.Read, path, "is no file of the folder");
        return file;
      }),
  }));
};
