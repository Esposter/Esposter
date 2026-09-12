// `R100` is git's marker for a rename with no content change, and the new path is what `path_filters` names
const PURE_RENAME_REGEX = /^R100\t[^\t]+\t(?<path>[^\t]+)$/u;

export const getPureRenamePaths = (nameStatus: string): string[] =>
  nameStatus
    .split("\n")
    .map((line) => PURE_RENAME_REGEX.exec(line)?.groups?.path)
    .filter((path) => path !== undefined);
