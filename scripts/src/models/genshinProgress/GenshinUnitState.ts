// Where a unit stands for this machine: done, runnable here, waiting on a named blocker, or blocked on the other machine
export enum GenshinUnitState {
  Blocked = "Blocked",
  Done = "Done",
  Runnable = "Runnable",
  Waiting = "Waiting",
}
