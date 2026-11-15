// A family of Everfrozen Earth's parts, which a witness render can draw in place of ours from the game's exports: its
// Ground alone, since the export holds no house of Snezhnograd's for the capital kit to stand in for
export const SnezhnayaPartFamily = { Ground: "Ground" } as const;
export type SnezhnayaPartFamily = (typeof SnezhnayaPartFamily)[keyof typeof SnezhnayaPartFamily];
