// Where a spawned process's output goes: read by the caller, or shown on this terminal
export enum SetupProcessStdio {
  Inherit = "inherit",
  Pipe = "pipe",
}
