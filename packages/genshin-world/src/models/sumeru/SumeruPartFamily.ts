// A family of Sumeru City's parts, which a witness render can draw in place of ours from the game's exports: its
// Ground and its buildings
export const SumeruPartFamily = { Buildings: "Buildings", Ground: "Ground" } as const;
export type SumeruPartFamily = (typeof SumeruPartFamily)[keyof typeof SumeruPartFamily];
