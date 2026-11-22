// The trailer keys a commit carries about a ledger
export const LedgerEventType = {
  // A pass over the unit landed
  Ledger: "Ledger",
  // A rule change that invalidates what a pass established, so the unit goes back to open
  Reopens: "Reopens",
  // A random sample of the ledger's never-swept units was read, and found the defects it counts
  Sampled: "Sampled",
} as const;
export type LedgerEventType = (typeof LedgerEventType)[keyof typeof LedgerEventType];

export const LedgerEventTypes: readonly LedgerEventType[] = Object.values(LedgerEventType);
