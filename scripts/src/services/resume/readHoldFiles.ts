import type { HoldFile } from "#src/models/resume/HoldFile";

import { HOLDS_DIRECTORY } from "#src/services/fleet/constants";
import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PID_EXTENSION = ".pid";

// The pid files in the holds directory, named `<entry>.<worker>.pid`
export const readHoldFiles = (): HoldFile[] =>
  existsSync(HOLDS_DIRECTORY)
    ? readdirSync(HOLDS_DIRECTORY)
        .filter((fileName) => fileName.endsWith(PID_EXTENSION))
        .map((fileName) => {
          const name = fileName.slice(0, -PID_EXTENSION.length);
          const separatorIndex = name.lastIndexOf(".");
          const pid = Number(readFileSync(join(HOLDS_DIRECTORY, fileName), "utf8"));
          return {
            entry: name.slice(0, separatorIndex),
            isRunning: checkIsProcessRunning(pid),
            worker: name.slice(separatorIndex + 1),
          };
        })
    : [];
