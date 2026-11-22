// What a fixer did with one finding: a fix to the code, a refutation the repository settles, or a fix to the rule that
// Owns the code, where the rule was the thing that was wrong
export const LedgerFixerOutcome = { Fixed: "fixed", Refuted: "refuted", Skill: "skill" } as const;
export type LedgerFixerOutcome = (typeof LedgerFixerOutcome)[keyof typeof LedgerFixerOutcome];
