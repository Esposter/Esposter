// A quantity a pass's measure records beside its readings, in the unit it is in, or the reason no value could be read
// For it. A diagnostic holds no gate, so it decides neither a reading's hold nor a pass's: it is printed for the record
// Only
export type ParityPassDiagnostic =
  | { name: string; reason: string; unit: string }
  | { name: string; unit: string; value: number };
