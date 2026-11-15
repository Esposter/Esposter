// What the fixer did with one finding: a fix it committed, a refutation the code or a later commit settles, or a
// Deferral to a later session. A finding it did not answer is deferred.
export const ReviewOutcome = { Deferred: "deferred", Fixed: "fixed", Refuted: "refuted" } as const;
export type ReviewOutcome = (typeof ReviewOutcome)[keyof typeof ReviewOutcome];
