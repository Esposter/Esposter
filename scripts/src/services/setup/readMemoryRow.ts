import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CLAUDE_PROJECTS_DIRECTORY, MEMORY_FOLDER_NAME, MEMORY_NEXT } from "#src/services/setup/constants";
import { getClaudeProjectSlug } from "#src/services/setup/getClaudeProjectSlug";
import { SetupStatus } from "#src/models/setup/SetupStatus";
import { join } from "node:path";

// Claude's memory folder for this checkout, reported as it is and never moved, copied or linked
export const readMemoryRow = (environment: SetupEnvironment): SetupRow => {
  const directory = join(CLAUDE_PROJECTS_DIRECTORY, getClaudeProjectSlug(REPOSITORY_ROOT), MEMORY_FOLDER_NAME);
  return {
    next: environment.exists(directory) ? MEMORY_NEXT : `no folder at ${directory}; ${MEMORY_NEXT}`,
    status: SetupStatus.Info,
    step: "memory",
  };
};
