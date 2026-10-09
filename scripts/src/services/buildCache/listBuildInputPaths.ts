import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BUILD_ROOT_INPUT_REGEX = /^(?:package\.json|tsdown\.config\.[cm]?[jt]s|tsconfig.*\.json)$/u;
// The folders whose every file a build reads: the source, and the declarations the tsconfig files include beside it
const BUILD_INPUT_DIRECTORIES = ["src", "types"];

// The files a package's build reads from its own folder, relative to it and sorted: `src/**`, `types/**` where it has
// One, its manifest, its tsdown configuration and its tsconfig files. Everything else in the folder is either output or
// A file no build reads.
export const listBuildInputPaths = (packageDirectory: string): string[] => {
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
    .filter((path) => statSync(join(packageDirectory, path)).isFile())
    .toSorted();
};
