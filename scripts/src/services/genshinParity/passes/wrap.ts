// A length along a plan wrapped into its rectangle, as the plan repeats past it
export const wrap = (value: number, length: number): number => ((value % length) + length) % length;
