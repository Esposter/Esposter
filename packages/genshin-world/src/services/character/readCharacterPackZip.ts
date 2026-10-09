import type { PickedCharacterPack } from "#src/models/character/PickedCharacterPack";

import { MACOS_RESOURCE_FORK_FOLDER } from "#src/services/character/constants";
import { decodeCharacterPackEntryNames } from "#src/services/character/decodeCharacterPackEntryNames";
import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { unzipSync } from "fflate";

// A release's zip as the files it holds, read in the browser: its entries' names listed without inflating any, decoded
// As the release wrote them, then cut into slash-separated paths, and only the entries asked for inflated when read. The
// Folders' own entries and the resource forks macOS's archiver adds under __MACOSX are no files of the release
export const readCharacterPackZip = (archiveName: string, bytes: Uint8Array): PickedCharacterPack => {
  const entryNames: string[] = [];
  unzipSync(bytes, {
    filter: ({ name }) => {
      if (!name.endsWith("/") && !name.startsWith(MACOS_RESOURCE_FORK_FOLDER)) entryNames.push(name);
      return false;
    },
  });
  const paths = decodeCharacterPackEntryNames(entryNames).map((name) => getCharacterPackFilePath(name));
  const pathEntryNameMap = new Map(paths.map((path, index) => [path, takeOne(entryNames, index)]));
  return {
    name: archiveName,
    paths,
    readFiles: (requestedPaths) => {
      const requestedEntryNames = new Set(requestedPaths.map((path) => pathEntryNameMap.get(path)));
      const entryNameBytesMap = unzipSync(bytes, { filter: ({ name }) => requestedEntryNames.has(name) });
      return requestedPaths.map((path) => {
        const entryBytes = entryNameBytesMap[pathEntryNameMap.get(path) ?? ""];
        if (entryBytes === undefined) throw new InvalidOperationError(Operation.Read, path, "is no file of the zip");
        return new Blob([entryBytes]);
      });
    },
  };
};
