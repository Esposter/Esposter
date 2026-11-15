// The two lanes a finding can come from (`code-review` skill): a quality cleanup, which is a preference with a cost,
// And a correctness claim, which must carry its trigger. The lanes never merge.
export const ReviewLane = { Correctness: "correctness", Quality: "quality" } as const;
export type ReviewLane = (typeof ReviewLane)[keyof typeof ReviewLane];
