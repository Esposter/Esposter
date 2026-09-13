import { getNameStatusEntries } from "#src/services/coderabbit/exclusions/getNameStatusEntries";

// `R100` is git's marker for a rename with no content change, and the new path is what `path_filters` names
export const getPureRenamePaths = (nameStatus: string): string[] =>
  getNameStatusEntries(nameStatus)
    .filter(({ status }) => status === "R100")
    .map(({ path }) => path);
