import { EXCLUDED_FOLDERS } from "#src/services/fleet/data/constants";
import { Operation } from "@esposter/shared";
import { InvalidOperationError } from "@esposter/shared";

// The folders a command names, comma-separated, refusing any the copy never takes
export const resolveFolders = (folders: string): string[] => {
  const names = folders
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");
  const excludedNames = names.filter((name) => EXCLUDED_FOLDERS.includes(name));
  if (excludedNames.length > 0)
    throw new InvalidOperationError(Operation.Read, "fleet data", `${excludedNames.join(", ")} are never copied`);
  return names;
};
