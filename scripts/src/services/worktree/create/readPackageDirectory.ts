import { NODE_MODULES_FOLDER } from "#src/services/worktree/remove/constants";
import { existsSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// The directory `packageName` resolves to from `fromPath`, read through its realpath: Node's own lookup order from there
// First, then the checkout's hoisted `node_modules/.pnpm/node_modules`, which holds what a package imports without declaring
// It. The package's exports are not consulted, since a package may not export its `package.json`. Undefined when neither
// Holds it
export const readPackageDirectory = (
  checkoutRoot: string,
  fromPath: string,
  packageName: string,
): string | undefined => {
  if (!existsSync(fromPath)) return undefined;
  const requireFromPath = createRequire(join(realpathSync(fromPath), "package.json"));
  const packagePath = [
    ...(requireFromPath.resolve.paths(packageName) ?? []),
    join(checkoutRoot, NODE_MODULES_FOLDER, ".pnpm", NODE_MODULES_FOLDER),
  ]
    .map((directory) => join(directory, packageName))
    .find((candidate) => existsSync(candidate));
  return packagePath === undefined ? undefined : realpathSync(packagePath);
};
