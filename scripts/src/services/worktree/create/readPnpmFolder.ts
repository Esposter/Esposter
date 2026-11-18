import { PNPM_FOLDER_PATH_REGEX } from "#src/services/worktree/create/constants";
import { existsSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// The store folder `packageName` resolves to from `fromPath`, by Node's own lookup order: the first `node_modules` on the
// Path that holds the package, read through its realpath. The package's exports are not consulted, since a package may not
// Export its `package.json`. Undefined when nothing on the path holds it, or it is not installed from the pnpm store
export const readPnpmFolder = (fromPath: string, packageName: string): string | undefined => {
  if (!existsSync(fromPath)) return undefined;
  const requireFromPath = createRequire(join(realpathSync(fromPath), "package.json"));
  const packagePath = requireFromPath.resolve
    .paths(packageName)
    ?.map((directory) => join(directory, packageName))
    .find((candidate) => existsSync(candidate));
  if (packagePath === undefined) return undefined;
  return realpathSync(packagePath).match(PNPM_FOLDER_PATH_REGEX)?.groups?.folder;
};
