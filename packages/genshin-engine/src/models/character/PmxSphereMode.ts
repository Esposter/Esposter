// How a PMX material's sphere map, a texture looked up by the surface's facing, is laid over its colour, by the byte the
// File stores it as: not at all, multiplied, added, or as a second texture read through the vertex's extra coordinates
export enum PmxSphereMode {
  Disabled = 0,
  Multiply = 1,
  Add = 2,
  AdditionalUv = 3,
}
