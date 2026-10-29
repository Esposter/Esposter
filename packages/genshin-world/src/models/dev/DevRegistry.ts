import type { DevHandle } from "#src/models/dev/DevHandle";
import type { DevResult } from "#src/models/dev/DevResult";
import type { DevScenario } from "#src/models/dev/DevScenario";

// The one table of commands and variables a console, a panel, a scenario and an automation all call into
export interface DevRegistry {
  register: (handle: DevHandle) => () => void;
  run: (line: string) => DevResult;
  runScenario: (scenario: DevScenario) => DevResult;
}
