// One side of a join: the left or the right operand of its condition
export const JoinSide = { Left: "left", Right: "right" } as const;
export type JoinSide = (typeof JoinSide)[keyof typeof JoinSide];
