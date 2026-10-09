// What the re-lands leave the pass: the wake owed to a held commit no run has tried at this `main` head yet — one first
// Found held this run, or one a session's re-land left behind it — since in a quiet queue no event brings that run
export interface RelandResult {
  retriggerDelaySeconds?: number;
}
