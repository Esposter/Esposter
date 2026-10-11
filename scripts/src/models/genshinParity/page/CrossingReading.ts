import type { LoadBench } from "genshin-world/parity/models/LoadBench";

// A screen's crossing as the parity page reads it once settled: the milliseconds from the move to the end of the
// Measure that settles it, and the page's load bench taken from the move
export interface CrossingReading {
  bench: LoadBench;
  settledMs: number;
}
