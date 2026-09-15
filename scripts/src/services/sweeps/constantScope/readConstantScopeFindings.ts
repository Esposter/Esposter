import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getModuleScopeConstants } from "#src/services/sweeps/constantScope/getModuleScopeConstants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every suite in the repository, scanned, one `path:line: name` per constant a describe could hold. The pass
// Prints it and the workspace test asserts it empty, off the same scope.
export const readConstantScopeFindings = (): string[] =>
  getSweepFilePaths("*.test.ts").flatMap((path) =>
    getModuleScopeConstants(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")).map(
      ({ line, name }) => `${path}:${line}: ${name}`,
    ),
  );
