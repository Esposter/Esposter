// The two kinds of finding a fixer answers: a defect, where behaviour is wrong or a rule is broken with a real
// Consequence, and a tidy, a behaviour-preserving improvement the rule asks for
export const LedgerFindingKind = { Defect: "defect", Tidy: "tidy" } as const;
export type LedgerFindingKind = (typeof LedgerFindingKind)[keyof typeof LedgerFindingKind];
