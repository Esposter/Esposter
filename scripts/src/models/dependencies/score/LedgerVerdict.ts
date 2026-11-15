// The verdicts the score's disagreements are read against, the two a `dependencies.md` row can carry that the score can contradict
export const LedgerVerdict = { Absorb: "Absorb", Keep: "Keep" } as const;
export type LedgerVerdict = (typeof LedgerVerdict)[keyof typeof LedgerVerdict];
