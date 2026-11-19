import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readdirSync } from "node:fs";
import { join, posix, sep } from "node:path";

// Every Vue component under the given components folders, as a repository path, sorted
export const listComponentPaths = (componentDirectories: readonly string[]): string[] =>
  componentDirectories
    .flatMap((directory) =>
      readdirSync(join(REPOSITORY_ROOT, directory), { encoding: "utf8", recursive: true }).map((file) =>
        posix.join(directory, file.replaceAll(sep, "/")),
      ),
    )
    .filter((path) => path.endsWith(".vue"))
    .toSorted();
