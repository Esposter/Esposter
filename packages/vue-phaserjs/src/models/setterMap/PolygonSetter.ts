export const PolygonSetter = { Points: "points" } as const;
export type PolygonSetter = (typeof PolygonSetter)[keyof typeof PolygonSetter];
