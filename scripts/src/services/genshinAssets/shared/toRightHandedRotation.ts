// A rotation in the game's left-handed axes in three's right-handed ones, mirrored across z as `toRightHanded` mirrors
// A point: a mirrored rotation turns the other way about x and y
export const toRightHandedRotation = ([x = 0, y = 0, z = 0, w = 1]: readonly number[]): [
  number,
  number,
  number,
  number,
] => [-x, -y, z, w];
