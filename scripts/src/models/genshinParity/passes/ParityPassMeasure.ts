// What a pass's measure read: each reading against its gate, in the unit the reading is in, and the notes naming what
// Lies behind them (the renderers unclaimed, the landmarks furthest off)
export interface ParityPassMeasure {
  notes: string[];
  readings: { gate: number; name: string; unit: string; value: number }[];
}
