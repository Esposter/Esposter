import type { ParityPassReading } from "#src/models/genshinParity/passes/ParityPassReading";

// What a pass's measure read: each reading against its gate, in the unit the reading is in, and the notes naming what
// Lies behind them (the renderers unclaimed, the landmarks furthest off)
export interface ParityPassMeasure {
  // Set where the scene has nothing for the pass to read at all (no game sound matched to it, no part a clip moves), so
  // The run prints it not owed and goes on past it, where an empty reading alone stops the run at it
  isNotOwed?: true;
  notes: string[];
  readings: ParityPassReading[];
}
