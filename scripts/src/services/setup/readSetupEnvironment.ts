import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { runSetupProcess } from "#src/services/setup/runSetupProcess";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

// The machine itself: the steps read and change it through this and nothing else
export const readSetupEnvironment = (): SetupEnvironment => ({
  countFiles: (path) =>
    existsSync(path) ? readdirSync(path, { withFileTypes: true }).filter((entry) => entry.isFile()).length : undefined,
  exists: (path) => existsSync(path),
  makeDirectory: (path) => {
    mkdirSync(path, { recursive: true });
  },
  mainCheckoutRoot: readMainCheckoutRoot(),
  readText: (path) => (existsSync(path) ? readFileSync(path, "utf8") : undefined),
  run: (file, args) => runSetupProcess(file, args, "pipe"),
  runVisibly: (file, args) => runSetupProcess(file, args, "inherit"),
});
