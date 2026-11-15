export const CurveSetter = { Smoothness: "smoothness" } as const;
export type CurveSetter = (typeof CurveSetter)[keyof typeof CurveSetter];
