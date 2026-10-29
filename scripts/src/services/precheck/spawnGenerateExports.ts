import type { ExportsGeneration } from "@esposter/configuration";

import { CONFIGURATION_DISTRIBUTION_PATH } from "#src/services/precheck/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// Runs the generator the package's build runs, from the main checkout's built configuration, in a child node so the
// Distribution is loaded by the import the script names rather than by a dynamic import in source. It writes the barrels
// Into `packageDirectory`'s `src`, so the caller decides which directory that is
export const spawnGenerateExports = (
  packageDirectory: string,
  exportsGeneration: ExportsGeneration,
  lazyDirectories: string[],
  mainCheckoutRoot: string,
): void => {
  const distributionUrl = pathToFileURL(join(mainCheckoutRoot, CONFIGURATION_DISTRIBUTION_PATH)).href;
  const script = `const { generateExports } = await import(${JSON.stringify(distributionUrl)});\ngenerateExports(${JSON.stringify(packageDirectory)}, ${JSON.stringify(exportsGeneration)}, ${JSON.stringify(lazyDirectories)});`;
  const { status, stderr } = spawnSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" });
  if (status !== 0)
    throw new InvalidOperationError(
      Operation.Update,
      packageDirectory,
      `the generator failed: ${readFirstLine(stderr)}`,
    );
};
