// The face an Omni die shows: it counts as any elemental die, and it has no element of its own
export const GcgDieFace = { Omni: "Omni" } as const;
export type GcgDieFace = (typeof GcgDieFace)[keyof typeof GcgDieFace];
