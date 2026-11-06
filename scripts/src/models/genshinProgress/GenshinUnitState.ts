// Where a unit stands for this machine: done, runnable here, waiting on a named blocker, or blocked on the other machine.
// A quest is scripted when a session script names it, and not measurable when none does, until its checkbox is ticked
export enum GenshinUnitState {
  Blocked = "Blocked",
  Done = "Done",
  NotMeasurable = "NotMeasurable",
  Runnable = "Runnable",
  Scripted = "Scripted",
  Waiting = "Waiting",
}
