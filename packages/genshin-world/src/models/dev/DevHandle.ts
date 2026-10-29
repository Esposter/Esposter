import type { DevCommand } from "#src/models/dev/DevCommand";
import type { DevRenderer } from "#src/models/dev/DevRenderer";
import type { DevScenario } from "#src/models/dev/DevScenario";
import type { DevVariable } from "#src/models/dev/DevVariable";

// What an owner registers when it mounts and gives back on disposal: its commands, its variables, the scenarios that
// Show its state and the renderer whose counters the stats overlay reads
export interface DevHandle {
  commands: readonly DevCommand[];
  renderer?: () => DevRenderer | undefined;
  scenarios?: readonly DevScenario[];
  variables: readonly DevVariable[];
}
