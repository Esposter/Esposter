// A point in the game's axes in the export's, mirrored across x as the exports are: its x negated, the rest unchanged
export const mirrorAvatarPoint = ([x = 0, y = 0, z = 0]: readonly number[]): [number, number, number] => [-x, y, z];
