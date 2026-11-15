// The roof a building kit caps its walls with: a flat slab, or a cone standing on the walls' top
export const RoofKind = { Conical: "Conical", Flat: "Flat" } as const;
export type RoofKind = (typeof RoofKind)[keyof typeof RoofKind];
