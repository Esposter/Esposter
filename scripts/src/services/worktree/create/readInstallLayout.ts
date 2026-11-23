import { APPS_DIRECTORY, PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { NODE_MODULES_FOLDER } from "#src/services/worktree/remove/constants";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Which workspace folders hold a `node_modules`, as the install left them, one line each. A matching layout is
// Necessary for a Recorded run to replay, not sufficient: the tracer fingerprints every name in those folders too, so a
// Copy starts only there
export const readInstallLayout = (worktreePath: string): string =>
  [PACKAGES_DIRECTORY, APPS_DIRECTORY]
    .flatMap((directory) =>
      readdirSync(join(worktreePath, directory))
        .toSorted()
        .map(
          (name) =>
            `${directory}/${name}: ${existsSync(join(worktreePath, directory, name, NODE_MODULES_FOLDER)) ? "installed" : "absent"}`,
        ),
    )
    .join("\n");
