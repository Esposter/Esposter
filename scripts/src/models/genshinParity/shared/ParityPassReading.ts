// A reading a pass's measure took against its gate, in the unit it is in; or one no value could be read for, which
// Carries the reason and holds the pass as a reading over its gate would
export type ParityPassReading =
  | { gate: number; name: string; reason: string; unit: string }
  | { gate: number; name: string; unit: string; value: number };
