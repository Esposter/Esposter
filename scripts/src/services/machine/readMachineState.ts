import type { MachineStateFile } from "#src/models/machine/MachineStateFile";

import { machineStateFileSchema } from "#src/models/machine/MachineStateFile";
import { MACHINE_STATE_PATH } from "#src/services/machine/constants";
import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";

// The watcher's latest reading, or undefined when it has written none yet or the file is not one. A file that exists and
// Cannot be read is an error, since reading it as none would report the watcher as not running
export const readMachineState = (): MachineStateFile | undefined =>
  getResult(() => readFileSync(MACHINE_STATE_PATH, "utf8")).match(
    (text) =>
      getResult(() => machineStateFileSchema.safeParse(parseMachineJson(text))).match(
        (result) => (result.success ? result.data : undefined),
        () => undefined,
      ),
    (error) => {
      if (!checkIsNotFound(error)) throw error;
      return undefined;
    },
  );
