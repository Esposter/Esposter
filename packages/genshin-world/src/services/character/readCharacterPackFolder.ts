import type { PickedCharacterPack } from "#src/models/character/PickedCharacterPack";

import { InvalidOperationError, Operation } from "@esposter/shared";

// An extracted release's folder as the files it holds, each by its path from the folder picked, as a folder input names
// It, each a file the browser reads only when asked for. A release only shipped as a RAR, as Lumine's of 2020 is, is read this way once the
// Player extracts it
export const readCharacterPackFolder = (files: readonly File[]): PickedCharacterPack => {
  const pathFileMap = new Map(files.map((file) => [file.webkitRelativePath || file.name, file]));
  const [folderName = ""] = pathFileMap.keys().next().value?.split("/") ?? [];
  return {
    name: folderName,
    paths: [...pathFileMap.keys()],
    readFiles: (paths) =>
      paths.map((path) => {
        const file = pathFileMap.get(path);
        if (file === undefined) throw new InvalidOperationError(Operation.Read, path, "is no file of the folder");
        return file;
      }),
  };
};
