// What a fixer did with one finding: a fix to the code, a refutation the repository settles, a fix to the rule that
// Owns the code where the rule was the thing that was wrong, or a finding confirmed and left open for a change it
// Cannot make
export const LedgerFixerOutcome = { Fixed: "fixed", Open: "open", Refuted: "refuted", Skill: "skill" } as const;
export type LedgerFixerOutcome = (typeof LedgerFixerOutcome)[keyof typeof LedgerFixerOutcome];
