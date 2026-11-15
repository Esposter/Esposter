export const DepthSetter = { Depth: "depth" } as const;
export type DepthSetter = (typeof DepthSetter)[keyof typeof DepthSetter];
