import { checkExcluded } from "#src/services/checkExcluded";
import { checkHasExport } from "#src/services/checkHasExport";
import { BARREL_FILE, NON_SOURCE_SUFFIXES } from "#src/services/constants";
import { globSync } from "node:fs";
import { join } from "node:path";

// The `src`-relative modules the source barrel lists, which a sweep reads as the barrel's own list without the build having
// Written it. A module a barrel leaves out is absent: a lazy directory's, which the package loads through an `import()` of
// Its own, and a subpath entry's, which its own entry reaches. A barrel line for either would load it with the entry
export const getSourceSpecifiers = (sourceDirectory: string, excludedPaths: string[]): string[] =>
  globSync("**/*.ts", { cwd: sourceDirectory })
    .map((path) => path.replaceAll("\\", "/"))
    .filter(
      (path) =>
        path !== BARREL_FILE &&
        !path.endsWith(".d.ts") &&
        !NON_SOURCE_SUFFIXES.some((suffix) => path.endsWith(suffix)) &&
        !checkExcluded(path, excludedPaths) &&
        checkHasExport(join(sourceDirectory, path)),
    );
