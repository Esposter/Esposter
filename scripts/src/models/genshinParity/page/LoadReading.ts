import type { CrossingReading } from "#src/models/genshinParity/page/CrossingReading";
import type { LoadBench } from "genshin-world/parity/models/LoadBench";

// A screen's load as the parity page reads it at ready: the milliseconds from navigation start to that moment, and the
// Page's load bench taken then, with the crossing after it when one was measured
export interface LoadReading {
  bench: LoadBench;
  crossing?: CrossingReading;
  readyMs: number;
}
