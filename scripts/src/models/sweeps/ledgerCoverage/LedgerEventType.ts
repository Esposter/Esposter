// The trailer keys a commit carries about a ledger row
export const LedgerEventType = {
  // A pass over the unit landed
  Ledger: "Ledger",
  // A rule change that invalidates what a pass established, so the row goes back to open
  Reopens: "Reopens",
} as const;
export type LedgerEventType = (typeof LedgerEventType)[keyof typeof LedgerEventType];

export const LedgerEventTypes: readonly LedgerEventType[] = Object.values(LedgerEventType);
