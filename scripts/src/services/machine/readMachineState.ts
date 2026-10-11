import type { MachineStateFile } from "#src/models/machine/MachineStateFile";

import { machineStateFileSchema } from "#src/models/machine/MachineStateFile";
import { MACHINE_STATE_PATH } from "#src/services/machine/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";

// The watcher's latest reading, or undefined when it has written none yet or the file is not one
export const readMachineState = (): MachineStateFile | undefined =>
  existsSync(MACHINE_STATE_PATH)
    ? getResult(() =>
        machineStateFileSchema.safeParse(parseMachineJson(readFileSync(MACHINE_STATE_PATH, "utf8"))),
      ).match(
        (result) => (result.success ? result.data : undefined),
        () => undefined,
      )
    : undefined;
