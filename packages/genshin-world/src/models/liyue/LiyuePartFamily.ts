// A family of Liyue Harbor's parts, which a witness render can draw in place of ours from the game's exports: its
// Ground, and the harbour's buildings the capital kit stands in for
export const LiyuePartFamily = { Buildings: "Buildings", Ground: "Ground" } as const;
export type LiyuePartFamily = (typeof LiyuePartFamily)[keyof typeof LiyuePartFamily];
