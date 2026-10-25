import { checkHasExport } from "#src/services/checkHasExport";
import { BARREL_FILE, NON_SOURCE_SUFFIXES } from "#src/services/constants";
import { globSync } from "node:fs";
import { join } from "node:path";

// The `src`-relative modules the source barrel lists, which a sweep reads as the barrel's own list without the build having
// Written it. A module under a lazy directory is left out so the entry does not load it: the package reaches it through an
// `import()` of its own, which a barrel line would undo by statically importing the module into the entry.
export const getSourceSpecifiers = (sourceDirectory: string, lazyDirectories: string[]): string[] =>
  globSync("**/*.ts", { cwd: sourceDirectory })
    .map((path) => path.replaceAll("\\", "/"))
    .filter(
      (path) =>
        path !== BARREL_FILE &&
        !path.endsWith(".d.ts") &&
        !NON_SOURCE_SUFFIXES.some((suffix) => path.endsWith(suffix)) &&
        !lazyDirectories.some((directory) => path.startsWith(`${directory}/`)) &&
        checkHasExport(join(sourceDirectory, path)),
    );
