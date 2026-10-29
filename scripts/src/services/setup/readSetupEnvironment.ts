import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { runSetupProcess } from "#src/services/setup/runSetupProcess";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

// The machine itself: the steps read and change it through this and nothing else
export const readSetupEnvironment = (): SetupEnvironment => ({
  exists: (path) => existsSync(path),
  makeDirectory: (path) => {
    mkdirSync(path, { recursive: true });
  },
  readText: (path) => (existsSync(path) ? readFileSync(path, "utf8") : undefined),
  run: (file, args) => runSetupProcess(file, args, "pipe"),
  runVisibly: (file, args) => runSetupProcess(file, args, "inherit"),
});
