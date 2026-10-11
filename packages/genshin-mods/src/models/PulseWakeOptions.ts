// What the wake decision reads of the session: whether a turn is running, whether a usage reserve winds down, the last
// Wake's time in milliseconds (zero when the idle episode has not woken the session yet), and the time now
export interface PulseWakeOptions {
  isTurnRunning: boolean;
  isWindDown: boolean;
  lastWakeMs: number;
  nowMs: number;
}
