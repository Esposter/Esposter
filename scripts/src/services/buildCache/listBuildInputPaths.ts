import { readGeneratedBarrelPaths } from "#src/services/buildCache/readGeneratedBarrelPaths";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BUILD_ROOT_INPUT_REGEX = /^(?:package\.json|tsdown\.config\.[cm]?[jt]s|tsconfig.*\.json)$/u;
// The folders whose every file a build reads: the source, and the declarations the tsconfig files include beside it
const BUILD_INPUT_DIRECTORIES = ["src", "types"];

// The files a package's build reads from its own folder, relative to it and sorted: `src/**`, `types/**` where it has
// One, its manifest, its tsdown configuration and its tsconfig files. Everything else in the folder is either output or
// A file no build reads, and the barrels the build generates into `src` are output too.
export const listBuildInputPaths = (packageDirectory: string): string[] => {
  const generatedPaths = new Set(readGeneratedBarrelPaths(packageDirectory));
  const rootInputPaths = readdirSync(packageDirectory, { encoding: "utf8" }).filter((name) =>
    BUILD_ROOT_INPUT_REGEX.test(name),
  );
  const directoryInputPaths = BUILD_INPUT_DIRECTORIES.filter((directory) =>
    existsSync(join(packageDirectory, directory)),
  ).flatMap((directory) =>
    readdirSync(join(packageDirectory, directory), { encoding: "utf8", recursive: true }).map(
      (path) => `${directory}/${path.split("\\").join("/")}`,
    ),
  );
  return [...rootInputPaths, ...directoryInputPaths]
    .filter((path) => !generatedPaths.has(path) && statSync(join(packageDirectory, path)).isFile())
    .toSorted();
};
