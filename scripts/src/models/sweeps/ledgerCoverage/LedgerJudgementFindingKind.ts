// The kind a reader writes a finding as: a defect or a tidy, or `unread` for the reason its unit could not be read in
// Full
export const LedgerJudgementFindingKind = { Defect: "defect", Tidy: "tidy", Unread: "unread" } as const;
export type LedgerJudgementFindingKind = (typeof LedgerJudgementFindingKind)[keyof typeof LedgerJudgementFindingKind];
