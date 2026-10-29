import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { CLAUDE_PROJECTS_DIRECTORY, MEMORY_FOLDER_NAME, MEMORY_NEXT } from "#src/services/setup/constants";
import { getClaudeProjectSlug } from "#src/services/setup/getClaudeProjectSlug";
import { join } from "node:path";

// Claude's memory folder for the main checkout, where the owner's memory lives whichever checkout the command runs in. It is
// reported by its file count as it is, and never moved, copied or linked
export const readMemoryRow = (environment: SetupEnvironment): SetupRow => {
  const directory = join(
    CLAUDE_PROJECTS_DIRECTORY,
    getClaudeProjectSlug(environment.mainCheckoutRoot),
    MEMORY_FOLDER_NAME,
  );
  const fileCount = environment.countFiles(directory);
  return {
    next:
      fileCount === undefined
        ? `no folder at ${directory}; ${MEMORY_NEXT}`
        : `${fileCount} files at ${directory}; ${MEMORY_NEXT}`,
    status: SetupStatus.Info,
    step: "memory",
  };
};
