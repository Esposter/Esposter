// Which side of a comparison a probe reads: the reference, our last shot of its screen, or both
export const ProbeSide = { Both: "both", Ours: "ours", Reference: "reference" } as const;
export type ProbeSide = (typeof ProbeSide)[keyof typeof ProbeSide];
