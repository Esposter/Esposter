import type { DevCommand } from "#src/models/dev/DevCommand";
import type { DevVariable } from "#src/models/dev/DevVariable";

// What an owner registers when it mounts and gives back on disposal: its commands and its variables
export interface DevHandle {
  commands: readonly DevCommand[];
  variables: readonly DevVariable[];
}
