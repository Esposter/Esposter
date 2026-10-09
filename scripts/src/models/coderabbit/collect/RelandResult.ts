// What the re-lands leave the pass: the soonest wake a held commit is owed — one first found held this run, one a
// Session's re-land left behind it, one returned to the owed set, or one whose wait after a failed try ends — since in a
// Quiet queue no event brings that run
export interface RelandResult {
  retriggerDelaySeconds?: number;
}
