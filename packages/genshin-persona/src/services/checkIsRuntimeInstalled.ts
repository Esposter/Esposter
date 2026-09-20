import { RUNTIME_LOCKFILE_PATH, RUNTIME_MODULES_DIRECTORY, RUNTIME_SOURCE_DIRECTORY } from "#src/services/constants";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

// Installed from the lockfile the plugin carries now: a bumped lockfile is a runtime to install again
export const checkIsRuntimeInstalled = (): boolean =>
  existsSync(RUNTIME_MODULES_DIRECTORY) &&
  existsSync(RUNTIME_LOCKFILE_PATH) &&
  readFileSync(RUNTIME_LOCKFILE_PATH, "utf8") ===
    readFileSync(join(RUNTIME_SOURCE_DIRECTORY, basename(RUNTIME_LOCKFILE_PATH)), "utf8");
