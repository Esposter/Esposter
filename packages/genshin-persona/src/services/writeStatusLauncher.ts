import { STATUS_LAUNCHER_PATH, STATUS_SCRIPT_PATH } from "#src/services/constants";
import { writeStateFile } from "#src/services/writeStateFile";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// An install lands under a directory named after its version, so a status line pointing straight at the script
// Breaks on every update. The setting points at this launcher in the state directory instead, and every session
// Start re-aims it at the install that is running, so an update is followed on the next session
export const writeStatusLauncher = (): void => {
  const launcher = `import ${JSON.stringify(pathToFileURL(STATUS_SCRIPT_PATH).href)};\n`;
  const isCurrent = existsSync(STATUS_LAUNCHER_PATH) && readFileSync(STATUS_LAUNCHER_PATH, "utf8") === launcher;
  if (!isCurrent) writeStateFile(STATUS_LAUNCHER_PATH, launcher);
};
