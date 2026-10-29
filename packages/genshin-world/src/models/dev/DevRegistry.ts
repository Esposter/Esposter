import type { DevHandle } from "#src/models/dev/DevHandle";
import type { DevRenderer } from "#src/models/dev/DevRenderer";
import type { DevResult } from "#src/models/dev/DevResult";
import type { DevScenario } from "#src/models/dev/DevScenario";
import type { DevVariable } from "#src/models/dev/DevVariable";

// The one table of commands and variables a console, a panel, a scenario and an automation all call into
export interface DevRegistry {
  // The renderer of the handle registered last that holds one, read each time, so a stats overlay sees the scene it draws
  getRenderer: () => DevRenderer | undefined;
  getScenarios: () => readonly DevScenario[];
  getVariables: () => readonly DevVariable[];
  register: (handle: DevHandle) => () => void;
  run: (line: string) => DevResult;
  runScenario: (scenario: DevScenario) => DevResult;
  // Calls the listener after every line runs and every handle registers or goes, so a panel reads its values again
  subscribe: (listener: () => void) => () => void;
}
