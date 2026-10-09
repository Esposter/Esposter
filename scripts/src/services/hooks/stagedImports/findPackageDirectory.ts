import { posix } from "node:path";

// The nearest directory above a file that holds a package.json the index tracks, the repository root reading as "".
// The root is the stop, so a file under no package reads the root's imports, which name none
export const findPackageDirectory = (path: string, committedPaths: ReadonlySet<string>): string => {
  let directory = posix.dirname(path);
  while (directory !== "." && !committedPaths.has(posix.join(directory, "package.json")))
    directory = posix.dirname(directory);
  return directory === "." ? "" : directory;
};
