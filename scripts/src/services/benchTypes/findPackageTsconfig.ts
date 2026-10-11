import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// The nearest tsconfig at or above the source is the package's own, the options a case is measured under
export const findPackageTsconfig = (sourcePath: string): string => {
  let directory = dirname(sourcePath);
  while (!existsSync(join(directory, "tsconfig.json"))) {
    const parentDirectory = dirname(directory);
    if (parentDirectory === directory)
      throw new InvalidOperationError(Operation.Read, sourcePath, "no tsconfig.json at or above the type bench");

    directory = parentDirectory;
  }

  return join(directory, "tsconfig.json");
};
