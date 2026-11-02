import { EXCLUDED_FOLDERS } from "#src/services/fleet/data/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A plain folder name, which the peer's shell reads unquoted in its manifest command, so nothing else may be in one
const PLAIN_FOLDER_NAME_REGEX = /^[\w-]+$/u;

// The folders a command names, comma-separated, refusing any the copy never takes or that is not a plain folder name
export const resolveFolders = (folders: string): string[] => {
  const names = folders
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");
  const excludedNames = names.filter((name) => EXCLUDED_FOLDERS.includes(name));
  if (excludedNames.length > 0)
    throw new InvalidOperationError(Operation.Read, "fleet data", `${excludedNames.join(", ")} are never copied`);
  const invalidNames = names.filter((name) => !PLAIN_FOLDER_NAME_REGEX.test(name));
  if (invalidNames.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      "fleet data",
      `${invalidNames.join(", ")} are not plain folder names of letters, digits, dashes and underscores`,
    );
  return names;
};
