// What a PMX morph moves, by the byte the file stores it as: other morphs, vertices, bones, a texture coordinate or one
// Of the four extra ones, a material, a flip between morphs, or an impulse on a rigid body
export enum PmxMorphKind {
  Group = 0,
  Vertex = 1,
  Bone = 2,
  Uv = 3,
  AdditionalUv1 = 4,
  AdditionalUv2 = 5,
  AdditionalUv3 = 6,
  AdditionalUv4 = 7,
  Material = 8,
  Flip = 9,
  Impulse = 10,
}
