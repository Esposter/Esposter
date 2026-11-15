export const FlipSetter = { FlipX: "flipX", FlipY: "flipY" } as const;
export type FlipSetter = (typeof FlipSetter)[keyof typeof FlipSetter];
