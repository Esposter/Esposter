// A point in the game's axes in the export's, mirrored across x as the exports are: its x negated, the rest unchanged
export const mirrorAvatarPoint = ([x = 0, y = 0, z = 0]: readonly number[]): [number, number, number] => [-x, y, z];

// A rotation's quaternion mirrored across x, the conjugate of the rotation by that mirror: its y and z negated, its x and w
// Kept, so a rotation turns the way the mirrored model turns
export const mirrorAvatarRotation = ([x = 0, y = 0, z = 0, w = 1]: readonly number[]): [
  number,
  number,
  number,
  number,
] => [x, -y, -z, w];
