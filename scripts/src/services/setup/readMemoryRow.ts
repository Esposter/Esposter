import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { MEMORY_FOLDER_NAME, MEMORY_NEXT } from "#src/services/setup/constants";
import { getClaudeProjectSlug } from "#src/services/setup/getClaudeProjectSlug";
import { dirname, join } from "node:path";

// The main checkout's root, which every linked worktree shares with it. Read through the environment, so a machine without
// Git gets this row's answer rather than an error that stops the whole table
const readMainCheckoutRoot = (environment: SetupEnvironment): string | undefined => {
  const { status, stdout } = environment.run("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  return status === 0 && stdout !== null ? dirname(stdout.trim()) : undefined;
};

// Claude's memory folder for the main checkout, where the owner's memory lives whichever checkout the command runs in.
// It is reported by its file count as it is, and never moved, copied or linked
export const readMemoryRow = (environment: SetupEnvironment): SetupRow => {
  const mainCheckoutRoot = readMainCheckoutRoot(environment);
  if (mainCheckoutRoot === undefined)
    return { next: `no main checkout to read memory from; ${MEMORY_NEXT}`, status: SetupStatus.Info, step: "memory" };
  const directory = join(
    environment.claudeProjectsDirectory,
    getClaudeProjectSlug(mainCheckoutRoot),
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
