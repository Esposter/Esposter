import type { LoadBench } from "genshin-world/parity/models/LoadBench";

// A screen's load as the parity page reads it at ready: the milliseconds from navigation start to that moment, and the
// Page's load bench taken then
export interface LoadReading {
  bench: LoadBench;
  readyMs: number;
}
