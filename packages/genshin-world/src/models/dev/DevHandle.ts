import type { DevCommand } from "#src/models/dev/DevCommand";
import type { DevScenario } from "#src/models/dev/DevScenario";
import type { DevVariable } from "#src/models/dev/DevVariable";

// What an owner registers when it mounts and gives back on disposal: its commands, its variables and the scenarios that
// Show its state
export interface DevHandle {
  commands: readonly DevCommand[];
  scenarios?: readonly DevScenario[];
  variables: readonly DevVariable[];
}
