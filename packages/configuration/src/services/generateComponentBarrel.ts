import { COMPONENTS_DIRECTORY } from "#src/services/constants";
import { getComponentName } from "#src/services/getComponentName";
import { writeBarrel } from "#src/services/writeBarrel";
import { globSync } from "node:fs";
import { join } from "node:path";

// Every component at any depth, named by its path as Nuxt names the app's (`getComponentName`); two of one name are two
// Exports of one name, which the build rejects rather than letting one shadow the other
export const generateComponentBarrel = (sourceDirectory: string): void => {
  const directory = join(sourceDirectory, COMPONENTS_DIRECTORY);
  writeBarrel(
    directory,
    globSync("**/*.vue", { cwd: directory }).map((path) => path.replaceAll("\\", "/")),
    (path) => `export { default as ${getComponentName(path)} } from "./${path}";`,
  );
};
