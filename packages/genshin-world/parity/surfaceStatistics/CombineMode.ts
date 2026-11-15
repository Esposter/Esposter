// The term modes the combine pass reads, as the shader's numbers
export const CombineMode = {
  Product: 0,
  Ratio: 1,
  SquaredDifference: 2,
  SquaredDeviation: 3,
  Sum: 4,
  Coverage: 5,
} as const;
export type CombineMode = (typeof CombineMode)[keyof typeof CombineMode];
