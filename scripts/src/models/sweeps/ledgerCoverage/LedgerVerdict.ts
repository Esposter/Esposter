// The verdict a reader gives one question's unit: the worst kind of finding it holds, or `unread` for a unit the reader
// Could not read in full
export const LedgerVerdict = { Clean: "clean", Defect: "defect", Tidy: "tidy", Unread: "unread" } as const;
export type LedgerVerdict = (typeof LedgerVerdict)[keyof typeof LedgerVerdict];
