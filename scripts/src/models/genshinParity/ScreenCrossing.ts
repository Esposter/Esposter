// A move a screen makes once it is ready, which `load --crossing` measures: the props it loads with, the props it is
// Moved to, and the load step whose measure, once taken after the move, marks the move settled
export interface ScreenCrossing {
  fromProps: Record<string, unknown>;
  settleStep: string;
  toProps: Record<string, unknown>;
}
