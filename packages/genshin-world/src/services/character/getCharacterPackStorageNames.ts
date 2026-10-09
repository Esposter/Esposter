import { takeOne } from "@esposter/shared";

// The names directly below a path among the paths of the files a storage keys by, each path's parts joined by slashes:
// A folder's name once however many files lie below it
export const getCharacterPackStorageNames = (storedPaths: readonly string[], path: readonly string[]): string[] => {
  const prefix = path.map((part) => `${part}/`).join("");
  return [
    ...new Set(
      storedPaths
        .filter((storedPath) => storedPath.startsWith(prefix))
        .map((storedPath) => takeOne(storedPath.slice(prefix.length).split("/"))),
    ),
  ];
};
