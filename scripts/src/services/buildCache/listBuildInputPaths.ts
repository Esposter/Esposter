import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BUILD_ROOT_INPUT_REGEX = /^(?:package\.json|tsdown\.config\.[cm]?[jt]s|tsconfig.*\.json)$/u;

// The files a package's build reads from its own folder, relative to it and sorted: `src/**`, its manifest, its tsdown
// Configuration and its tsconfig files. Everything else in the folder is either output or a file no build reads.
export const listBuildInputPaths = (packageDirectory: string): string[] => {
  const rootInputPaths = readdirSync(packageDirectory, { encoding: "utf8" }).filter((name) =>
    BUILD_ROOT_INPUT_REGEX.test(name),
  );
  const sourcePaths = readdirSync(join(packageDirectory, "src"), { encoding: "utf8", recursive: true }).map(
    (path) => `src/${path.split("\\").join("/")}`,
  );
  return [...rootInputPaths, ...sourcePaths]
    .filter((path) => statSync(join(packageDirectory, path)).isFile())
    .toSorted();
};
