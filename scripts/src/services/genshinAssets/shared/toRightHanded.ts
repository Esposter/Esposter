// A point in the game's left-handed axes (y up, z forward) in three's right-handed ones, mirrored across z, which is
// How every data file `fit` writes places things
export const toRightHanded = ([x = 0, y = 0, z = 0]: readonly number[]): [number, number, number] => [x, y, -z];
