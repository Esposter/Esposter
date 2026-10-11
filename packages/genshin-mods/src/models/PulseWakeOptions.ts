// What the wake decision reads of the session: whether a turn is running and whether a usage reserve winds down, so a
// Watcher line that lands then is not what wakes the session
export interface PulseWakeOptions {
  isTurnRunning: boolean;
  isWindDown: boolean;
}
