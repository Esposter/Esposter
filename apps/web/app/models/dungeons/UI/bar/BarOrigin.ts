export const BarOrigin = { Left: "Left", Middle: "Middle", Right: "Right" } as const;
export type BarOrigin = (typeof BarOrigin)[keyof typeof BarOrigin];
