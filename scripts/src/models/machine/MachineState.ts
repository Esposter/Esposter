// The machine's state for the window: idle has room for more runs, tight has none, and busy is anything between
export enum MachineState {
  Busy = "Busy",
  Idle = "Idle",
  Tight = "Tight",
}
