import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { runSetupProcess } from "#src/services/setup/runSetupProcess";
import { CLAUDE_PROJECTS_DIRECTORY } from "#src/services/shared/constants";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

// The machine itself: the steps read and change it through this and nothing else. The platform decides whether a process
// runs through a shell, so a test can pass the one it is not running on
export const readSetupEnvironment = (platform: NodeJS.Platform): SetupEnvironment => {
  const isThroughShell = platform === "win32";
  return {
    claudeProjectsDirectory: CLAUDE_PROJECTS_DIRECTORY,
    countFiles: (path) =>
      existsSync(path)
        ? readdirSync(path, { withFileTypes: true }).filter((entry) => entry.isFile()).length
        : undefined,
    exists: (path) => existsSync(path),
    makeDirectory: (path) => {
      mkdirSync(path, { recursive: true });
    },
    platform,
    readText: (path) => (existsSync(path) ? readFileSync(path, "utf8") : undefined),
    run: (file, args) => runSetupProcess(file, args, { isThroughShell, stdio: "pipe" }),
    runVisibly: (file, args) => runSetupProcess(file, args, { isThroughShell, stdio: "inherit" }),
  };
};
