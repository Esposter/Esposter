import type * as NodePty from "node-pty";

import { NODE_PTY_DIRECTORY_NAME } from "#src/services/installer/constants";
import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { createRequire } from "node:module";
import { join } from "node:path";
import { isSea } from "node:sea";

// Node-pty, loaded when the first shell opens rather than at startup. Its native addons, its worker and the agent it
// Forks are files it finds beside its own code, which a single executable cannot hold, so the executable loads the copy
// The install wrote out beside it; run from the package, it is an ordinary import
export const loadNodePty = (): Promise<typeof NodePty> => {
  if (!isSea()) return import("node-pty");
  const installDirectory = getHostInstallDirectory();
  return Promise.resolve(
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the installed copy is the one this build embedded
    createRequire(join(installDirectory, "package.json"))(
      join(installDirectory, NODE_PTY_DIRECTORY_NAME),
    ) as typeof NodePty,
  );
};
