import { EXCLUDED_FOLDERS } from "#src/services/fleet/data/constants";
import { WORD_AND_HYPHEN_NAME_REGEX } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The folders a command names, comma-separated, refusing any the copy never takes or that is not a plain folder name
export const resolveFolders = (folders: string): string[] => {
  const names = folders
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");
  const excludedNames = names.filter((name) => EXCLUDED_FOLDERS.includes(name));
  if (excludedNames.length > 0)
    throw new InvalidOperationError(Operation.Read, "fleet data", `${excludedNames.join(", ")} are never copied`);
  // A plain folder name, which the peer's shell reads unquoted in its manifest command, so nothing else may be in one
  const invalidNames = names.filter((name) => !WORD_AND_HYPHEN_NAME_REGEX.test(name));
  if (invalidNames.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      "fleet data",
      `${invalidNames.join(", ")} are not plain folder names of letters, digits, dashes and underscores`,
    );
  return names;
};
