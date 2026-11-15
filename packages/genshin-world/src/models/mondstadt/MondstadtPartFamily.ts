// A family of Mondstadt City's parts, which a witness render can draw in place of ours from the game's exports: its
// Ground, and the city's buildings the capital kit stands in for
export const MondstadtPartFamily = { Buildings: "Buildings", Ground: "Ground" } as const;
export type MondstadtPartFamily = (typeof MondstadtPartFamily)[keyof typeof MondstadtPartFamily];
