// A family of Inazuma City's parts, which a witness render can draw in place of ours from the game's exports: its
// Ground and its buildings
export const InazumaPartFamily = { Buildings: "Buildings", Ground: "Ground" } as const;
export type InazumaPartFamily = (typeof InazumaPartFamily)[keyof typeof InazumaPartFamily];
