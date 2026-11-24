// How a PMX material's sphere map, a texture looked up by the surface's facing, is laid over its colour, by the byte
// The file stores it as: not at all, multiplied, added, or as a second texture read through the vertex's extra
// Coordinates
export const PmxSphereMode = { Disabled: 0, Multiply: 1, Add: 2, AdditionalUv: 3 } as const;
export type PmxSphereMode = (typeof PmxSphereMode)[keyof typeof PmxSphereMode];
