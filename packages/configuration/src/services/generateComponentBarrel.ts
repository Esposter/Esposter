import { checkInLazyDirectory } from "#src/services/checkInLazyDirectory";
import { COMPONENTS_DIRECTORY } from "#src/services/constants";
import { getComponentName } from "#src/services/getComponentName";
import { writeBarrel } from "#src/services/writeBarrel";
import { globSync } from "node:fs";
import { join } from "node:path";

// Every component at any depth, named by its path as Nuxt names the app's (`getComponentName`); two of one name are two
// Exports of one name, which the build rejects rather than letting one shadow the other. A component under a lazy
// Directory is left out as its source module is, since its barrel line would load it with the entry
export const generateComponentBarrel = (sourceDirectory: string, lazyDirectories: string[]): void => {
  const directory = join(sourceDirectory, COMPONENTS_DIRECTORY);
  writeBarrel(
    directory,
    globSync("**/*.vue", { cwd: directory })
      .map((path) => path.replaceAll("\\", "/"))
      .filter((path) => !checkInLazyDirectory(`${COMPONENTS_DIRECTORY}/${path}`, lazyDirectories)),
    (path) => `export { default as ${getComponentName(path)} } from "./${path}";`,
  );
};
