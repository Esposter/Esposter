import { GENSHIN_PACKAGE_PREFIX } from "#src/services/genshinParity/componentReference/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { existsSync } from "node:fs";
import { join, posix } from "node:path";

// Each genshin package's components folder, keyed by the package's name. Read off the workspace rather than listed, so a
// New package with a components folder is a root the day it is added
export const readComponentRoots = (): Map<string, string> =>
  new Map(
    readWorkspacePackages(REPOSITORY_ROOT).flatMap(({ directory, manifest, workspaceDirectory }) => {
      const name = manifest.name ?? "";
      const componentsDirectory = posix.join(workspaceDirectory, directory, "src", "components");
      return name.startsWith(GENSHIN_PACKAGE_PREFIX) && existsSync(join(REPOSITORY_ROOT, componentsDirectory))
        ? [[name, componentsDirectory] as const]
        : [];
    }),
  );
