// An axis of the scene's own space, by the name a vector's component is read under
export const SceneAxis = { X: "x", Y: "y", Z: "z" } as const;
export type SceneAxis = (typeof SceneAxis)[keyof typeof SceneAxis];
