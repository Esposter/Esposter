export const EllipseSetter = { Smoothness: "smoothness" } as const;
export type EllipseSetter = (typeof EllipseSetter)[keyof typeof EllipseSetter];
