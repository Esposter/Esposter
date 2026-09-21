import { writeStateFile } from "#src/services/writeStateFile";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// An install lands under a directory named after its version, so a user setting pointing straight at a script
// Breaks on every update. The setting points at a launcher in the state directory instead, and every session
// Start re-aims it at the install that is running, so an update is followed on the next session
export const writeLauncher = (launcherPath: string, scriptPath: string): void => {
  const launcher = `import ${JSON.stringify(pathToFileURL(scriptPath).href)};\n`;
  const isCurrent = existsSync(launcherPath) && readFileSync(launcherPath, "utf8") === launcher;
  if (!isCurrent) writeStateFile(launcherPath, launcher);
};
