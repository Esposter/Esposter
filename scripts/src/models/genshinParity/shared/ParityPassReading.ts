// A reading a pass's measure took against its gate, in the unit it is in; or one no value could be read for, which
// Carries the reason and holds the pass as a reading over its gate would. A strict reading holds only strictly below its
// Gate, so a measure that changed nothing, reading exactly its gate, holds none
export type ParityPassReading =
  | { gate: number; name: string; reason: string; unit: string }
  | { gate: number; name: string; strict?: true; unit: string; value: number };
