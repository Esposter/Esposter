// Where one unit of a ledger stands
export const UnitState = {
  // No pass has read it since its last reopen, and no clean sample covers it
  Open: "Open",
  // Unread, but its ledger's latest sample found no defect, and neither a reopen nor a change to its code came after
  Sampled: "Sampled",
  // A pass read it, on the date and with the model its trailer names
  Swept: "Swept",
} as const;
export type UnitState = (typeof UnitState)[keyof typeof UnitState];
